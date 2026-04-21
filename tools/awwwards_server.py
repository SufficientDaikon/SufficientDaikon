"""
Awwwards Portfolio Scraper — MCP Server (SOTA)
Extracts design ideas, CSS techniques, JavaScript patterns, interaction code,
and animation methods from award-winning portfolio websites.
"""

import re
import time
from urllib.parse import urlparse
from fastmcp import FastMCP
import httpx
from bs4 import BeautifulSoup

mcp = FastMCP("awwwards", instructions="""
You have access to the Awwwards portfolio gallery — a curated collection of award-winning websites.

Use these tools to:
- Browse the gallery for top-rated portfolio sites
- Deep-analyze individual sites for layout, color, typography, animation, and interaction patterns
- Extract CSS techniques, visual ideas, and structural approaches
- Search for specific design techniques across multiple sites

When the user asks for inspiration or ideas, use list_portfolios first, then analyze_portfolio on the most interesting ones.
""")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "DNT": "1",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}

# Self-cleaning cache with 15-minute TTL
CACHE: dict[str, tuple[float, str]] = {}
CACHE_TTL = 900  # 15 minutes


def cache_get(key: str) -> str | None:
    if key in CACHE:
        ts, val = CACHE[key]
        if time.time() - ts < CACHE_TTL:
            return val
        del CACHE[key]
    return None


def cache_set(key: str, val: str):
    # Evict expired entries if cache grows large
    if len(CACHE) > 100:
        now = time.time()
        expired = [k for k, (ts, _) in CACHE.items() if now - ts >= CACHE_TTL]
        for k in expired:
            del CACHE[k]
    CACHE[key] = (time.time(), val)


async def fetch_page(url: str, timeout: int = 30) -> str:
    """Fetch a page with proper headers and return HTML."""
    async with httpx.AsyncClient(
        headers=HEADERS,
        follow_redirects=True,
        timeout=timeout,
        verify=False,
    ) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.text


def extract_text(el) -> str:
    """Extract clean text from a BS4 element."""
    return el.get_text(strip=True) if el else ""


def resolve_url(href: str, base_url: str) -> str:
    """Resolve relative URLs to absolute."""
    if href.startswith("//"):
        return "https:" + href
    if href.startswith("/"):
        parsed = urlparse(base_url)
        return f"{parsed.scheme}://{parsed.netloc}{href}"
    if not href.startswith("http"):
        parsed = urlparse(base_url)
        return f"{parsed.scheme}://{parsed.netloc}/{href}"
    return href


async def resolve_awwwards_url(url: str) -> str:
    """If url is an Awwwards /sites/ detail page, resolve to the actual portfolio site URL."""
    if "awwwards.com/sites/" not in url:
        return url
    try:
        html = await fetch_page(url, timeout=15)
        soup = BeautifulSoup(html, "lxml")
        visit = soup.select_one("a[href*='http']:not([href*='awwwards'])[target='_blank']")
        if visit and visit.get("href"):
            return visit["href"]
    except Exception:
        pass
    return url


# ─────────────────────────── TOOLS ───────────────────────────


@mcp.tool()
async def list_portfolios(page: int = 1) -> str:
    """
    Browse the Awwwards portfolio gallery and list award-winning portfolio websites.
    Returns site names, URLs, ratings, and short descriptions.
    Each page has ~16 sites. Use page parameter to paginate.

    Args:
        page: Page number to browse (1-based). Default is 1.
    """
    ckey = f"list_{page}"
    cached = cache_get(ckey)
    if cached:
        return cached

    url = "https://www.awwwards.com/websites/portfolio/"
    if page > 1:
        url += f"?page={page}"

    try:
        html = await fetch_page(url)
    except Exception as e:
        return f"ERROR fetching Awwwards page {page}: {e}"

    soup = BeautifulSoup(html, "lxml")
    sites = []

    for entry in soup.select("li.js-collectable"):
        site: dict[str, str] = {}

        # Title + URL from /sites/ link slug
        site_link = entry.select_one("a[href*='/sites/']")
        if site_link:
            href = site_link["href"]
            slug = href.rstrip("/").split("/")[-1]
            site["title"] = slug.replace("-", " ").title()
            site["awwwards_url"] = resolve_url(href, url)

        # Author
        for a in entry.select("a"):
            text = extract_text(a)
            a_href = a.get("href", "")
            if text and "/sites/" not in a_href and text not in ("VOTE NOW", "WEBSITE", "PRO", ""):
                site["author"] = text.replace("PRO", "").strip()
                break

        # Score
        score_el = entry.select_one("[class*='score'], [class*='rating'], .vote")
        if score_el:
            nums = re.findall(r"[\d.]+", extract_text(score_el))
            if nums:
                site["score"] = nums[0]

        if site.get("title"):
            sites.append(site)

    result = f"## Awwwards Portfolio Gallery — Page {page}\n\n"
    result += f"Found {len(sites)} sites:\n\n"

    for i, site in enumerate(sites, 1):
        result += f"### {i}. {site.get('title', 'Unknown')}\n"
        if site.get("score"):
            result += f"- Score: {site['score']}\n"
        if site.get("author"):
            result += f"- By: {site['author']}\n"
        if site.get("awwwards_url"):
            result += f"- Awwwards: {site['awwwards_url']}\n"
        result += "\n"

    cache_set(ckey, result)
    return result


@mcp.tool()
async def analyze_portfolio(url: str) -> str:
    """
    Deep-analyze a specific website and extract design techniques, layout patterns,
    color palettes, typography, animations, and interaction ideas.

    Works on any URL — Awwwards detail pages or direct portfolio site URLs.
    If given an Awwwards /sites/ URL, it will first resolve the actual site URL.

    Args:
        url: The URL to analyze (awwwards detail page or direct site URL).
    """
    real_url = await resolve_awwwards_url(url)

    ckey = f"analyze_{real_url}"
    cached = cache_get(ckey)
    if cached:
        return cached

    try:
        html = await fetch_page(real_url, timeout=20)
    except Exception as e:
        return f"ERROR fetching {real_url}: {e}"

    soup = BeautifulSoup(html, "lxml")
    full_html = str(soup)

    # ── Collect ALL CSS (inline styles + <style> blocks) BEFORE any decomposition ──
    style_tags = soup.select("style")
    inline_styles = [el.get("style", "") for el in soup.select("[style]")]
    all_css = " ".join([s.string or "" for s in style_tags] + inline_styles)

    # ── Collect ALL JS (inline scripts + src list) BEFORE any decomposition ──
    script_elements = soup.select("script")
    script_srcs = [s.get("src", "") for s in script_elements if s.get("src")]
    inline_js_blocks = [s.string for s in script_elements if s.string and len(s.string.strip()) > 20]
    all_js = " ".join(inline_js_blocks) + " " + " ".join(script_srcs)

    # ── Now safe to decompose for text extraction ──
    for tag in soup(["noscript", "iframe"]):
        tag.decompose()

    analysis = f"## Design Analysis: {real_url}\n"
    if real_url != url:
        analysis += f"(Resolved from {url})\n"
    analysis += "\n"

    # ── COLOR PALETTE ──
    colors = set()
    hex_colors = re.findall(r"#(?:[0-9a-fA-F]{3,4}){1,2}\b", all_css)
    colors.update(hex_colors[:30])
    rgb_colors = re.findall(r"rgba?\([^)]+\)", all_css)
    colors.update(rgb_colors[:20])
    hsl_colors = re.findall(r"hsla?\([^)]+\)", all_css)
    colors.update(hsl_colors[:10])

    if colors:
        analysis += "### Color Palette\n"
        for c in sorted(colors):
            analysis += f"- `{c}`\n"
        analysis += "\n"

    # ── TYPOGRAPHY ──
    fonts = set()
    for f in re.findall(r"font-family:\s*([^;}{]+)", all_css):
        fonts.add(f.strip().strip("'\""))
    for link in soup.select("link[href*='fonts.googleapis.com']"):
        for fam in re.findall(r"family=([^&:]+)", link.get("href", "")):
            fonts.add(fam.replace("+", " "))

    if fonts:
        analysis += "### Typography\n"
        for f in sorted(fonts):
            analysis += f"- {f}\n"
        analysis += "\n"

    # ── CSS TECHNIQUES ──
    css_patterns = {
        "CSS Grid": r"display:\s*grid",
        "Subgrid": r"grid-template-(?:columns|rows):\s*subgrid",
        "Flexbox": r"display:\s*flex",
        "CSS Custom Properties (Variables)": r"var\(--",
        "CSS Animations (@keyframes)": r"@keyframes",
        "CSS Transitions": r"transition:",
        "CSS Transforms (3D)": r"transform.*(?:perspective|rotate[XYZ3]|translate[Z3])",
        "Backdrop Filter (Glassmorphism)": r"backdrop-filter",
        "Mix Blend Mode": r"mix-blend-mode",
        "Clip Path": r"clip-path",
        "CSS Filters (blur/grayscale/etc)": r"filter:\s*(?:blur|grayscale|brightness|contrast|saturate|hue-rotate|invert|sepia|drop-shadow)",
        "Scroll Snap": r"scroll-snap",
        "Sticky Positioning": r"position:\s*sticky",
        "Container Queries": r"@container",
        "CSS Clamp (Fluid Sizing)": r"clamp\(",
        "Aspect Ratio": r"aspect-ratio",
        "Gradient Text (background-clip)": r"background-clip:\s*text",
        "SVG Filters": r"<filter",
        "Mask / Mask Image": r"mask(?:-image)?:",
        "Writing Mode (Vertical Text)": r"writing-mode",
        "Custom Cursor": r"cursor:\s*(?:none|url)",
        "Scroll Behavior Smooth": r"scroll-behavior:\s*smooth",
        "View Transitions API": r"view-transition|::view-transition",
        "Scroll-Driven Animations": r"animation-timeline:\s*scroll|scroll-timeline",
        "CSS Nesting": r"&\s*[.#:\[]",
        "Color Mix / Relative Colors": r"color-mix|from\s+\w+\s+(?:l|c|h)",
        "Anchor Positioning": r"anchor\(|position-anchor",
        "Has Selector": r":has\(",
        "Container Style Queries": r"@container.*style\(",
    }

    detected_css = []
    combined = all_css + " " + full_html
    for name, pattern in css_patterns.items():
        if re.search(pattern, combined, re.IGNORECASE):
            detected_css.append(name)

    if detected_css:
        analysis += "### CSS Techniques Detected\n"
        for t in detected_css:
            analysis += f"- {t}\n"
        analysis += "\n"

    # ── JAVASCRIPT LIBRARIES / FRAMEWORKS ──
    lib_patterns = {
        "GSAP (GreenSock)": r"gsap|greensock|TweenMax|TweenLite|TimelineMax",
        "GSAP ScrollTrigger": r"ScrollTrigger",
        "GSAP SplitText": r"SplitText",
        "GSAP Flip": r"Flip\.fit|Flip\.from",
        "Three.js (3D/WebGL)": r"three\.js|three\.min|THREE\.",
        "Locomotive Scroll": r"locomotive",
        "Lenis (Smooth Scroll)": r"lenis",
        "Barba.js (Page Transitions)": r"barba",
        "Swiper (Slider)": r"swiper",
        "SplitType (Text Animation)": r"split-?type|SplitType",
        "Matter.js (2D Physics)": r"Matter\.|matter\.js",
        "PixiJS (2D WebGL)": r"PIXI\.|pixi\.js",
        "P5.js (Creative Coding)": r"p5\.js|createCanvas",
        "Anime.js": r"anime\.min|animejs|anime\(",
        "Framer Motion": r"framer-motion|motion\.div",
        "React": r"react\.production|react\.development|reactDOM|_react|__NEXT",
        "Next.js": r"__next|_next\/static|next\/router",
        "Nuxt": r"__nuxt|_nuxt",
        "Vue": r"vue\.js|vue\.min|__vue|createApp",
        "Svelte": r"svelte",
        "Astro": r"astro",
        "WebGL / Canvas 2D": r"getContext\(['\"]webgl|getContext\(['\"]2d",
        "Intersection Observer": r"IntersectionObserver",
        "Lottie (Animation)": r"lottie",
        "Shery.js (Mouse Effects)": r"shery|Shery",
        "OGL (WebGL)": r"ogl|OGl",
        "Curtains.js (WebGL)": r"curtains",
        "Flip (GSAP Plugin)": r"Flip\.from|Flip\.fit",
        "MorphSVG": r"MorphSVG|morphSVG",
        "DrawSVG": r"DrawSVG|drawSVG",
        "Motion One": r"motion\.animate|@motionone",
        "Popmotion": r"popmotion",
        "Rellax (Parallax)": r"rellax|Rellax",
        "AOS (Animate on Scroll)": r"AOS\.init|data-aos",
        "Typed.js (Typewriter)": r"Typed\(|typed\.js",
        "Particles.js": r"particles\.js|particlesJS",
        "tsParticles": r"tsparticles|tsParticles",
        "Rough Notation": r"RoughNotation|annotate\(",
        "Plyr (Video Player)": r"plyr|Plyr",
        "Lazysizes": r"lazysizes|lazyload",
    }

    detected_js = []
    for name, pattern in lib_patterns.items():
        if re.search(pattern, all_js, re.IGNORECASE):
            detected_js.append(name)

    if detected_js:
        analysis += "### JavaScript Libraries / Frameworks\n"
        for lib in detected_js:
            analysis += f"- {lib}\n"
        analysis += "\n"

    # ── PAGE STRUCTURE ──
    analysis += "### Page Structure\n"
    for label, selectors in [
        ("Sections", "section, [class*='section'], [class*='block']"),
        ("Navigation", "nav, header, [class*='nav'], [class*='header']"),
        ("Hero / Intro", "[class*='hero'], [class*='banner'], [class*='intro']"),
        ("Footer", "footer, [class*='footer']"),
        ("Canvas", "canvas"),
        ("SVG", "svg"),
        ("Video", "video"),
        ("Iframe", "iframe"),
    ]:
        count = len(soup.select(selectors))
        if count:
            analysis += f"- {label}: {count}\n"
    analysis += "\n"

    # ── KEY CLASS NAMES ──
    all_classes = set()
    for el in soup.select("[class]"):
        for c in el.get("class", []):
            if len(c) > 2 and not c.startswith("js-") and not re.match(r"^[a-z]{1,2}\d+$", c):
                all_classes.add(c)

    design_kw = [
        "hero", "parallax", "scroll", "anim", "fade", "slide", "reveal",
        "cursor", "hover", "glow", "glass", "blur", "gradient", "mask",
        "split", "magnetic", "smooth", "marquee", "ticker", "orbit",
        "grid", "flex", "sticky", "overlay", "modal", "dark", "light",
        "theme", "canvas", "webgl", "3d", "rotate", "tilt", "morph",
        "distort", "glitch", "noise", "grain", "line", "dot", "particle",
        "wave", "blob", "circle", "shader", "loader", "preload", "menu",
        "transform", "scale", "skew", "clip", "wipe", "flip", "drag",
        "inertia", "spring", "elastic", "bounce", "ease", "stagger",
    ]

    interesting = sorted([c for c in all_classes if any(kw in c.lower() for kw in design_kw)])[:50]
    if interesting:
        analysis += "### Notable CSS Classes (Design Clues)\n"
        for c in interesting:
            analysis += f"- `.{c}`\n"
        analysis += "\n"

    # ── DATA ATTRIBUTES (Animation/Interaction Hints) ──
    data_attrs = set()
    for el in soup.select("[data-speed], [data-scroll], [data-parallax], [data-aos], [data-gsap], [data-animate], [data-cursor], [data-magnetic], [data-delay], [data-duration], [data-direction], [data-offset], [data-split], [data-hover], [data-reveal], [data-src]"):
        for attr in el.attrs:
            if attr.startswith("data-") and attr not in ("data-v", "data-reactid"):
                val = el.get(attr, "")
                if val and len(str(val)) < 60:
                    data_attrs.add(f'{attr}="{val}"')
                else:
                    data_attrs.add(attr)

    if data_attrs:
        analysis += "### Data Attributes (Interaction/Animation Config)\n"
        for da in sorted(data_attrs)[:30]:
            analysis += f"- `{da}`\n"
        analysis += "\n"

    # ── META / OG ──
    meta_desc = soup.select_one("meta[name='description']")
    og_desc = soup.select_one("meta[property='og:description']")
    desc = ""
    if og_desc and og_desc.get("content"):
        desc = og_desc["content"]
    elif meta_desc and meta_desc.get("content"):
        desc = meta_desc["content"]
    if desc:
        analysis += f"### Site Description\n{desc}\n\n"

    # ── HEADINGS ──
    headings = soup.select("h1, h2, h3")[:12]
    if headings:
        analysis += "### Key Headings\n"
        for h in headings:
            text = extract_text(h)
            if text and len(text) > 1:
                analysis += f"- {h.name.upper()}: {text[:120]}\n"
        analysis += "\n"

    # ── MEDIA QUERIES / BREAKPOINTS ──
    breakpoints = set()
    for bp in re.findall(r"@media[^{]*\b(\d+)px", all_css):
        breakpoints.add(int(bp))
    if breakpoints:
        analysis += "### Responsive Breakpoints\n"
        for bp in sorted(breakpoints):
            analysis += f"- {bp}px\n"
        analysis += "\n"

    cache_set(ckey, analysis)
    return analysis


@mcp.tool()
async def extract_css(url: str) -> str:
    """
    Extract all inline CSS and linked stylesheet content from a website.
    Returns raw CSS code for detailed analysis of techniques, variables, animations.

    Args:
        url: The website URL to extract CSS from.
    """
    real_url = await resolve_awwwards_url(url)

    ckey = f"css_{real_url}"
    cached = cache_get(ckey)
    if cached:
        return cached

    try:
        html = await fetch_page(real_url, timeout=20)
    except Exception as e:
        return f"ERROR fetching {real_url}: {e}"

    soup = BeautifulSoup(html, "lxml")
    result = f"## CSS Extraction: {real_url}\n\n"

    # ── Inline <style> blocks ──
    style_tags = soup.select("style")
    all_inline_css = ""
    if style_tags:
        result += "### Inline <style> Blocks\n\n"
        for i, tag in enumerate(style_tags, 1):
            css_text = tag.string or ""
            if css_text.strip():
                all_inline_css += css_text
                display = css_text[:8000] + "\n/* ... truncated ... */" if len(css_text) > 8000 else css_text
                result += f"```css\n/* Block {i} */\n{display.strip()}\n```\n\n"

    # ── External stylesheets (first 3) ──
    css_links = soup.select("link[rel='stylesheet'][href]")
    if css_links:
        result += "### External Stylesheets\n\n"
        for link in css_links[:3]:
            href = resolve_url(link["href"], real_url)
            try:
                css_content = await fetch_page(href, timeout=10)
                all_inline_css += css_content
                display = css_content[:10000] + "\n/* ... truncated ... */" if len(css_content) > 10000 else css_content
                result += f"**{href}**\n```css\n{display.strip()}\n```\n\n"
            except Exception:
                result += f"**{href}** — could not fetch\n\n"

    # ── CSS Custom Properties ──
    custom_props = re.findall(r"(--[\w-]+)\s*:\s*([^;}{]+)", all_inline_css)
    if custom_props:
        result += "### CSS Custom Properties (Design Tokens)\n\n"
        seen = set()
        for prop, value in sorted(set(custom_props))[:60]:
            if prop not in seen:
                result += f"- `{prop}: {value.strip()}`\n"
                seen.add(prop)
        result += "\n"

    # ── Keyframe Animations ──
    keyframes = re.findall(r"@keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}", all_inline_css)
    if keyframes:
        result += "### Keyframe Animations\n\n"
        for name, body in keyframes[:20]:
            result += f"**@keyframes {name}**\n```css\n{body.strip()}\n```\n\n"

    # ── Media Queries ──
    media_queries = re.findall(r"(@media\s*[^{]+)\{", all_inline_css)
    if media_queries:
        unique_mq = sorted(set(mq.strip() for mq in media_queries))[:15]
        result += "### Media Queries\n\n"
        for mq in unique_mq:
            result += f"- `{mq}`\n"
        result += "\n"

    cache_set(ckey, result)
    return result


@mcp.tool()
async def search_awwwards(query: str) -> str:
    """
    Search Awwwards for specific design techniques, styles, or site types.
    Good for finding sites with specific features like 'dark mode', '3d animation',
    'brutalist', 'minimalist', 'interactive', etc.

    Args:
        query: Search term (e.g., 'dark portfolio', 'brutalist design', '3d webgl').
    """
    search_url = f"https://www.awwwards.com/awwwards/search/?q={query.replace(' ', '+')}"

    try:
        html = await fetch_page(search_url)
    except Exception as e:
        return f"ERROR searching Awwwards for '{query}': {e}"

    soup = BeautifulSoup(html, "lxml")

    # Deduplicate /sites/ links
    seen = set()
    results = []
    for a in soup.select("a[href*='/sites/']"):
        href = a.get("href", "")
        if href.startswith("/"):
            href = f"https://www.awwwards.com{href}"
        if href in seen or "/sites/" not in href:
            continue
        seen.add(href)
        slug = href.rstrip("/").split("/")[-1]
        title = slug.replace("-", " ").title()
        results.append({"title": title, "url": href})

    output = f"## Awwwards Search: '{query}'\n\n"
    output += f"Found {len(results)} results:\n\n"
    for i, r in enumerate(results[:20], 1):
        output += f"{i}. **{r['title']}** — {r['url']}\n"

    if not results:
        output += "No results found. Try broader terms.\n"

    return output


@mcp.tool()
async def get_design_ideas(category: str = "portfolio") -> str:
    """
    Get curated design ideas and common patterns from top Awwwards portfolio sites.
    Analyzes multiple sites and returns a summary of recurring techniques and trends.

    Args:
        category: Category to analyze. Default 'portfolio'. Options: portfolio, dark, minimal, creative, 3d.
    """
    category_urls = {
        "portfolio": "https://www.awwwards.com/websites/portfolio/",
        "dark": "https://www.awwwards.com/websites/portfolio/?color=dark",
        "minimal": "https://www.awwwards.com/websites/portfolio/?style=minimal",
        "creative": "https://www.awwwards.com/websites/portfolio/?style=creative",
        "3d": "https://www.awwwards.com/websites/portfolio/?feature=3d",
    }

    url = category_urls.get(category, category_urls["portfolio"])

    try:
        html = await fetch_page(url)
    except Exception as e:
        return f"ERROR: {e}"

    soup = BeautifulSoup(html, "lxml")

    # Extract sites
    unique_sites = {}
    for link in soup.select("a[href*='/sites/']"):
        href = link.get("href", "")
        if href.startswith("/"):
            href = f"https://www.awwwards.com{href}"
        slug = href.rstrip("/").split("/")[-1]
        title = slug.replace("-", " ").title()
        if title and href not in unique_sites and len(title) > 2:
            unique_sites[href] = title

    output = f"## Design Trends: {category.title()} Category\n\n"
    output += f"### Top {category.title()} Sites ({len(unique_sites)} found)\n\n"
    for i, (site_url, title) in enumerate(list(unique_sites.items())[:15], 1):
        output += f"{i}. **{title}** — {site_url}\n"

    output += """

### Actionable Design Ideas for Portfolio Sites

**Layout Patterns:**
- Full-viewport hero with oversized typography (120px+ display)
- Horizontal scroll sections for case studies / project showcases
- Split-screen layouts with asymmetric columns
- Sticky navigation with scroll progress indicator bar
- Marquee / infinite ticker text banners between sections
- Bento grid layouts for skills/metrics
- Z-pattern reading flow with alternating content blocks

**Animation Techniques:**
- GSAP ScrollTrigger for scroll-linked animations (pin, scrub, stagger)
- SplitType → GSAP for character-by-character text reveals
- Lenis for smooth, native-feeling scroll with inertia
- Clip-path reveals on scroll (circle, polygon, inset transitions)
- Stagger animations on grid items entering viewport
- Scroll-velocity-based skew/distortion on images
- Page transition effects with Barba.js + GSAP

**Hover & Interaction:**
- Magnetic hover on buttons (mouse proximity pull)
- Custom cursor with mix-blend-mode difference
- Hover-triggered video previews replacing static images
- 3D tilt cards with perspective transform on mousemove
- Text stroke-to-fill transition on hover
- Image distortion/displacement on hover (WebGL/CSS)
- Drag-to-explore project carousels with momentum

**Visual Effects:**
- Grain/noise SVG texture overlay (subtle, 3-5% opacity)
- WebGL/Three.js background effects (particles, blobs, gradients)
- Gradient mesh backgrounds with CSS or canvas
- Monochrome palette with single vivid accent color
- Scroll-driven parallax depth layers
- Animated gradient borders / glow effects
- CRT scanline / VHS distortion overlays

**Typography:**
- Oversized display fonts with variable weight
- Mixed serif + sans-serif pairing (editorial feel)
- Outlined/stroke text for section headers
- Text masking with images or video behind letterforms
- Kinetic typography on scroll (rotate, scale, translate)
- Monospace accents for technical/data labels

**Modern CSS:**
- Scroll-driven animations (animation-timeline: scroll())
- View Transitions API for page transitions
- Container queries for component-level responsive design
- :has() selector for parent-aware styling
- Subgrid for aligned nested layouts
- Anchor positioning for tooltips/popovers
- Color-mix() for dynamic color variants

**Loading & Transitions:**
- Boot sequence / ASCII terminal preloader
- Logo morph animation during page load
- Staggered content reveal after preloader
- Route transitions with FLIP animation technique
- Skeleton screens with shimmer loading effect
"""

    return output


if __name__ == "__main__":
    mcp.run()
