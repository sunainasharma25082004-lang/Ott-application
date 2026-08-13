import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

output_dir = r"C:\Users\jhasa\OneDrive\Desktop\VIZ_TV_PlayStore_Assets"
os.makedirs(output_dir, exist_ok=True)

# Load existing logo & banner if available
existing_logo_path = r"c:\Users\jhasa\OneDrive\Desktop\DESKTOP THINGS\OTT-Plateform\Ott-application\ottweb\public\app-logo.png"
existing_banner_path = r"c:\Users\jhasa\OneDrive\Desktop\DESKTOP THINGS\OTT-Plateform\Ott-application\ottweb\public\hero-banner.png"

logo_img = Image.open(existing_logo_path).convert("RGBA") if os.path.exists(existing_logo_path) else None
banner_img = Image.open(existing_banner_path).convert("RGBA") if os.path.exists(existing_banner_path) else None

def get_font(size, bold=False):
    font_names = [
        "arialbd.ttf" if bold else "arial.ttf",
        "segoeui.ttf",
        "tahoma.ttf",
    ]
    for font_name in font_names:
        try:
            return ImageFont.truetype(font_name, size)
        except OSError:
            continue
    return ImageFont.load_default()

# -------------------------------------------------------------
# 1. APP ICON (512 x 512 px)
# -------------------------------------------------------------
icon_size = 512
icon = Image.new("RGBA", (icon_size, icon_size), (10, 11, 16, 255))
draw_icon = ImageDraw.Draw(icon)

# Radial background gradient
for r in range(400, 0, -2):
    alpha = int(255 * (1 - r / 400))
    color = (40, 8, 20, alpha)
    draw_icon.ellipse([256 - r, 256 - r, 256 + r, 256 + r], fill=color)

# Draw glossy rounded square background
margin = 48
bg_box = [margin, margin, icon_size - margin, icon_size - margin]
draw_icon.rounded_rectangle(bg_box, radius=80, fill=(229, 9, 20, 255))

# Overlay logo or text
if logo_img:
    logo_resized = logo_img.resize((320, 320), Image.Resampling.LANCZOS)
    # Mask to rounded rectangle
    mask = Image.new("L", (320, 320), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, 320, 320], radius=60, fill=255)
    icon.paste(logo_resized, (96, 96), mask)
else:
    font_large = get_font(72, bold=True)
    draw_icon.text((256, 220), "VIZ TV", fill=(255, 255, 255, 255), font=font_large, anchor="mm")

# Inner border highlight
draw_icon.rounded_rectangle(bg_box, radius=80, outline=(255, 255, 255, 80), width=4)

icon.save(os.path.join(output_dir, "app_icon_512x512.png"))
print("Created app_icon_512x512.png")

# -------------------------------------------------------------
# 2. FEATURE GRAPHIC (1024 x 500 px)
# -------------------------------------------------------------
fg_w, fg_h = 1024, 500
feature_g = Image.new("RGBA", (fg_w, fg_h), (10, 11, 16, 255))
draw_fg = ImageDraw.Draw(feature_g)

# Background gradient & glowing flares
for x in range(fg_w):
    ratio = x / fg_w
    r = int(14 + ratio * 40)
    g = int(5 + ratio * 5)
    b = int(20 + ratio * 30)
    draw_fg.line([(x, 0), (x, fg_h)], fill=(r, g, b, 255))

# Red glowing circle on left
flare = Image.new("RGBA", (600, 600), (0, 0, 0, 0))
flare_draw = ImageDraw.Draw(flare)
flare_draw.ellipse([0, 0, 600, 600], fill=(229, 9, 20, 60))
flare = flare.filter(ImageFilter.GaussianBlur(80))
feature_g.paste(flare, (-100, -50), flare)

# Draw text on left
font_title = get_font(52, bold=True)
font_sub = get_font(26, bold=True)
font_desc = get_font(20, bold=False)

draw_fg.text((80, 140), "VIZ TV", fill=(229, 9, 20, 255), font=font_title)
draw_fg.text((80, 210), "STREAMING & LIVE TALENT HUNT", fill=(255, 255, 255, 255), font=font_sub)
draw_fg.text((80, 260), "Watch 4K Blockbuster Movies, Web Series\n& Upload Video Auditions for Live Fan Voting", fill=(180, 185, 200, 255), font=font_desc)

# Badge pill
draw_fg.rounded_rectangle([80, 350, 360, 395], radius=20, fill=(229, 9, 20, 220))
font_badge = get_font(18, bold=True)
draw_fg.text((220, 372), "OFFICIAL ANDROID APP", fill=(255, 255, 255, 255), font=font_badge, anchor="mm")

# Right side graphic / hero banner composite
if banner_img:
    banner_resized = banner_img.resize((500, 360), Image.Resampling.LANCZOS)
    mask = Image.new("L", (500, 360), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.rounded_rectangle([0, 0, 500, 360], radius=24, fill=255)
    
    # Border & shadow frame
    feature_g.paste(banner_resized, (480, 70), mask)
    draw_fg.rounded_rectangle([480, 70, 980, 430], radius=24, outline=(255, 255, 255, 60), width=3)

feature_g.save(os.path.join(output_dir, "feature_graphic_1024x500.png"))
print("Created feature_graphic_1024x500.png")

# -------------------------------------------------------------
# HELPER FOR 1080x1920 SCREENSHOTS
# -------------------------------------------------------------
def create_screenshot(filename, header_title, header_sub, content_drawer_fn):
    sw, sh = 1080, 1920
    sc = Image.new("RGBA", (sw, sh), (10, 11, 16, 255))
    draw_sc = ImageDraw.Draw(sc)

    # Gradient background
    for y in range(sh):
        ratio = y / sh
        r = int(14 + (1 - ratio) * 35)
        g = int(7 + (1 - ratio) * 5)
        b = int(22 + ratio * 15)
        draw_sc.line([(0, y), (sw, y)], fill=(r, g, b, 255))

    # Top Header text
    f_h1 = get_font(46, bold=True)
    f_h2 = get_font(28, bold=False)
    draw_sc.text((sw // 2, 140), header_title, fill=(255, 255, 255, 255), font=f_h1, anchor="mm")
    draw_sc.text((sw // 2, 205), header_sub, fill=(229, 9, 20, 255), font=f_h2, anchor="mm")

    # Phone Frame Container
    pw, ph = 840, 1500
    px, py = (sw - pw) // 2, 280
    draw_sc.rounded_rectangle([px - 16, py - 16, px + pw + 16, py + ph + 16], radius=56, fill=(26, 29, 45, 255), outline=(229, 9, 20, 180), width=4)
    
    # Phone Screen area
    phone_screen = Image.new("RGBA", (pw, ph), (14, 16, 26, 255))
    p_draw = ImageDraw.Draw(phone_screen)

    # Phone notch & status bar
    p_draw.rounded_rectangle([pw // 2 - 120, 12, pw // 2 + 120, 38], radius=14, fill=(9, 10, 15, 255))
    f_status = get_font(20, bold=True)
    p_draw.text((40, 16), "9:41", fill=(200, 205, 220, 255), font=f_status)
    p_draw.text((pw - 40, 16), "VIZ TV 5G 100%", fill=(200, 205, 220, 255), font=f_status, anchor="ra")

    # App Header inside phone
    p_draw.rectangle([0, 50, pw, 130], fill=(20, 24, 38, 255))
    if logo_img:
        l_thumb = logo_img.resize((50, 50), Image.Resampling.LANCZOS)
        phone_screen.paste(l_thumb, (30, 65), l_thumb)
    f_brand = get_font(30, bold=True)
    p_draw.text((95, 90), "VIZ TV", fill=(229, 9, 20, 255), font=f_brand, anchor="lm")
    p_draw.rounded_rectangle([pw - 160, 72, pw - 30, 108], radius=10, fill=(229, 9, 20, 200))
    f_badge = get_font(18, bold=True)
    p_draw.text((pw - 95, 90), "● LIVE", fill=(255, 255, 255, 255), font=f_badge, anchor="mm")

    # Custom inner content
    content_drawer_fn(phone_screen, p_draw, pw, ph)

    # Bottom App Bar
    p_draw.rectangle([0, ph - 90, pw, ph], fill=(18, 21, 33, 255))
    f_nav = get_font(22, bold=True)
    p_draw.text((pw * 0.15, ph - 45), "🔥 Discover", fill=(229, 9, 20, 255), font=f_nav, anchor="mm")
    p_draw.text((pw * 0.40, ph - 45), "🎬 Movies", fill=(160, 165, 180, 255), font=f_nav, anchor="mm")
    p_draw.text((pw * 0.65, ph - 45), "🏆 Contest", fill=(160, 165, 180, 255), font=f_nav, anchor="mm")
    p_draw.text((pw * 0.88, ph - 45), "👤 Profile", fill=(160, 165, 180, 255), font=f_nav, anchor="mm")

    # Paste phone screen onto full canvas
    sc.paste(phone_screen, (px, py))
    sc.save(os.path.join(output_dir, filename))
    print(f"Created {filename}")

# -------------------------------------------------------------
# SCREENSHOT 1: TALENT HUNT SHOWCASE
# -------------------------------------------------------------
def draw_talent_hunt_screen(screen, draw, pw, ph):
    # Main reel card
    draw.rounded_rectangle([30, 150, pw - 30, ph - 110], radius=24, fill=(25, 30, 48, 255), outline=(255, 255, 255, 30), width=2)
    
    # Poster / Background image if available
    if banner_img:
        b_crop = banner_img.resize((pw - 60, 750), Image.Resampling.LANCZOS)
        screen.paste(b_crop, (30, 150))
    
    # Overlay info box
    draw.rectangle([30, 800, pw - 30, ph - 110], fill=(14, 16, 26, 240))
    
    draw.rounded_rectangle([50, 820, 280, 860], radius=10, fill=(229, 9, 20, 255))
    f_cat = get_font(20, bold=True)
    draw.text((165, 840), "🎤 SINGING REEL", fill=(255, 255, 255, 255), font=f_cat, anchor="mm")
    
    f_name = get_font(34, bold=True)
    draw.text((50, 890), "Ananya Roy (Season 4 Candidate)", fill=(255, 255, 255, 255), font=f_name)
    
    f_sub = get_font(24, bold=False)
    draw.text((50, 935), "Acoustic Vocal Audition - 'Melody of Dreams'", fill=(180, 185, 200, 255), font=f_sub)

    # Voting action card
    draw.rounded_rectangle([50, 990, pw - 50, 1140], radius=20, fill=(30, 35, 55, 255), outline=(229, 9, 20, 100))
    f_vote = get_font(30, bold=True)
    draw.text((70, 1030), "👍 45,280 Fan Votes Received", fill=(255, 215, 0, 255), font=f_vote)
    f_vote_sub = get_font(22, bold=False)
    draw.text((70, 1080), "Rank #1 in Weekly Female Vocalist Auditions", fill=(200, 205, 220, 255), font=f_vote_sub)

    # Contestant guidelines box
    draw.rounded_rectangle([50, 1170, pw - 50, 1340], radius=20, fill=(22, 25, 40, 255))
    f_box_t = get_font(24, bold=True)
    draw.text((70, 1195), "Audition Categories Open:", fill=(255, 255, 255, 255), font=f_box_t)
    f_box_c = get_font(22, bold=False)
    draw.text((70, 1240), "• Singing & Vocals  • Dance & Choreography\n• Acting Monologues • Stand-Up Comedy", fill=(180, 185, 200, 255), font=f_box_c)

create_screenshot(
    "screenshot_1_talent_hunt_1080x1920.png",
    "🎤 LIVE TALENT HUNT SHOWCASE",
    "Upload Video Auditions & Win Cash Prizes",
    draw_talent_hunt_screen
)

# -------------------------------------------------------------
# SCREENSHOT 2: 4K VIDEO PLAYER
# -------------------------------------------------------------
def draw_player_screen(screen, draw, pw, ph):
    # Simulated video player
    draw.rounded_rectangle([30, 150, pw - 30, 620], radius=24, fill=(0, 0, 0, 255), outline=(229, 9, 20, 120), width=3)
    if banner_img:
        b_crop = banner_img.resize((pw - 60, 470), Image.Resampling.LANCZOS)
        screen.paste(b_crop, (30, 150))
    
    # Play button overlay
    draw.ellipse([pw // 2 - 50, 330, pw // 2 + 50, 430], fill=(229, 9, 20, 220))
    f_play = get_font(40, bold=True)
    draw.text((pw // 2 + 4, 380), "▶", fill=(255, 255, 255, 255), font=f_play, anchor="mm")

    # Progress bar
    draw.rectangle([50, 580, pw - 50, 588], fill=(80, 85, 100, 255))
    draw.rectangle([50, 580, 420, 588], fill=(229, 9, 20, 255))
    f_time = get_font(18, bold=True)
    draw.text((50, 595), "01:14:20 / 02:25:00", fill=(180, 185, 200, 255), font=f_time)
    draw.text((pw - 50, 595), "4K Ultra HD HDR10+", fill=(255, 215, 0, 255), font=f_time, anchor="ra")

    # Movie details
    f_m_title = get_font(36, bold=True)
    draw.text((30, 650), "Cyber Strike: The Final Protocol", fill=(255, 255, 255, 255), font=f_m_title)
    f_m_gen = get_font(24, bold=True)
    draw.text((30, 700), "Action • Sci-Fi • Cyberpunk | 2026 | ⭐ 4.9 Rating", fill=(229, 9, 20, 255), font=f_m_gen)

    # Feature cards
    draw.rounded_rectangle([30, 750, pw - 30, 920], radius=20, fill=(24, 28, 44, 255))
    f_feat_t = get_font(26, bold=True)
    draw.text((50, 780), "⚡ Ultra-Fast CDN & Zero Buffering", fill=(0, 242, 254, 255), font=f_feat_t)
    f_feat_s = get_font(22, bold=False)
    draw.text((50, 830), "Adaptive bitrate streaming adjusts dynamically for smooth playback on 3G, 4G, 5G, and Wi-Fi networks.", fill=(180, 185, 200, 255), font=f_feat_s)

    # Download offline card
    draw.rounded_rectangle([30, 950, pw - 30, 1120], radius=20, fill=(24, 28, 44, 255))
    draw.text((50, 980), "💾 Offline Downloads Supported", fill=(16, 185, 129, 255), font=f_feat_t)
    draw.text((50, 1030), "Save full movies and web series episodes to watch anytime on your device without internet connection.", fill=(180, 185, 200, 255), font=f_feat_s)

create_screenshot(
    "screenshot_2_4k_player_1080x1920.png",
    "📺 ULTRA HD 4K VIDEO PLAYER",
    "Blockbuster Movies, Web Series & Originals",
    draw_player_screen
)

# -------------------------------------------------------------
# SCREENSHOT 3: LIVE LEADERBOARD & VOTING
# -------------------------------------------------------------
def draw_leaderboard_screen(screen, draw, pw, ph):
    draw.rounded_rectangle([30, 150, pw - 30, 240], radius=20, fill=(229, 9, 20, 200))
    f_lb_t = get_font(30, bold=True)
    draw.text((pw // 2, 195), "🏆 Season 4 Live Contestant Rankings", fill=(255, 255, 255, 255), font=f_lb_t, anchor="mm")

    ranks = [
        ("🥇 Rank 1", "Priya Sharma", "Classical Vocalist", "24,500 Votes", (255, 215, 0)),
        ("🥈 Rank 2", "Rahul Verma", "Hip-Hop Choreography", "19,820 Votes", (220, 220, 230)),
        ("🥉 Rank 3", "Simran Kaur", "Dramatic Monologue", "15,400 Votes", (205, 127, 50)),
        ("⭐ Rank 4", "Amit Patel", "Stand-Up Comedy", "12,110 Votes", (0, 242, 254)),
    ]

    y_pos = 260
    for r_num, r_name, r_cat, r_votes, color in ranks:
        draw.rounded_rectangle([30, y_pos, pw - 30, y_pos + 120], radius=20, fill=(26, 30, 48, 255), outline=(255, 255, 255, 20))
        f_r1 = get_font(28, bold=True)
        draw.text((50, y_pos + 40), r_num, fill=color, font=f_r1)
        draw.text((220, y_pos + 35), r_name, fill=(255, 255, 255, 255), font=f_r1)
        f_r2 = get_font(20, bold=False)
        draw.text((220, y_pos + 75), r_cat, fill=(160, 165, 180, 255), font=f_r2)
        
        draw.rounded_rectangle([pw - 230, y_pos + 35, pw - 50, y_pos + 85], radius=12, fill=(229, 9, 20, 180))
        f_v = get_font(20, bold=True)
        draw.text((pw - 140, y_pos + 60), r_votes, fill=(255, 255, 255, 255), font=f_v, anchor="mm")
        y_pos += 140

create_screenshot(
    "screenshot_3_leaderboard_1080x1920.png",
    "🏆 LIVE FAN VOTING & LEADERBOARD",
    "Support Rising Stars & Vote Weekly",
    draw_leaderboard_screen
)

# -------------------------------------------------------------
# SCREENSHOT 4: USER PROFILE & WATCHLIST
# -------------------------------------------------------------
def draw_profile_screen(screen, draw, pw, ph):
    # Profile Card
    draw.rounded_rectangle([30, 150, pw - 30, 460], radius=24, fill=(26, 30, 48, 255), outline=(229, 9, 20, 120), width=2)
    draw.ellipse([pw // 2 - 60, 180, pw // 2 + 60, 300], fill=(229, 9, 20, 255))
    f_prof = get_font(50, bold=True)
    draw.text((pw // 2, 240), "👤", fill=(255, 255, 255, 255), font=f_prof, anchor="mm")

    f_pname = get_font(34, bold=True)
    draw.text((pw // 2, 335), "Krishna Kumar", fill=(255, 255, 255, 255), font=f_pname, anchor="mm")
    f_psub = get_font(22, bold=False)
    draw.text((pw // 2, 375), "VIP Premium Subscriber | Talent Contestant #402", fill=(180, 185, 200, 255), font=f_psub, anchor="mm")

    draw.rounded_rectangle([pw // 2 - 140, 405, pw // 2 + 140, 445], radius=10, fill=(255, 215, 0, 220))
    f_pbadge = get_font(20, bold=True)
    draw.text((pw // 2, 425), "★ VIP MEMBER ★", fill=(0, 0, 0, 255), font=f_pbadge, anchor="mm")

    # Watchlist Title
    f_wl_title = get_font(28, bold=True)
    draw.text((30, 500), "My Saved Watchlist & History", fill=(255, 255, 255, 255), font=f_wl_title)

    # Watchlist Items Grid
    items = ["🎬 Cyber Strike: Cyberpunk", "🎤 Talent Audition Highlights", "📺 Shadows of Destiny S1", "🎬 Echoes of Eternity"]
    y_p = 550
    for title in items:
        draw.rounded_rectangle([30, y_p, pw - 30, y_p + 90], radius=16, fill=(22, 25, 40, 255))
        f_it = get_font(24, bold=True)
        draw.text((60, y_p + 45), title, fill=(220, 225, 240, 255), font=f_it, anchor="lm")
        f_play_sm = get_font(22, bold=True)
        draw.text((pw - 60, y_p + 45), "▶ Resume", fill=(229, 9, 20, 255), font=f_play_sm, anchor="rm")
        y_p += 110

create_screenshot(
    "screenshot_4_profile_watchlist_1080x1920.png",
    "👤 PERSONALIZED WATCHLIST & SYNC",
    "Sync Across Android, Tablet & Smart TV",
    draw_profile_screen
)

print("SUCCESS: All Google Play Store listing assets generated in:", output_dir)
