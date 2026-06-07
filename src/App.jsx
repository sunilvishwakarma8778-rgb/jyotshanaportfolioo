import { useState, useEffect, useRef } from "react";
import "./App.css";
import profilePhoto from './assets/images/Frame 32.png';

const skills = [
  { name: "Adobe Photoshop", level: 85 },
  { name: "Adobe Illustrator", level: 80 },
  { name: "Adobe InDesign", level: 70 },
  { name: "Adobe After Effects", level: 65 },
  { name: "Adobe Premiere Pro", level: 75 },
  { name: "2D Design", level: 55 },
  { name: "UI/UX Design", level: 50 },
];

const projects = [
  {
    title: "Graphic Design",
    icon: "🎨",
    desc: "Social media posts, banners, logos, and marketing materials.",
    color: "#FF6FB7",
  },
  {
    title: "Video Editing",
    icon: "🎬",
    desc: "Reels editing, short videos, and creative content creation.",
    color: "#1A3A6B",
  },
  {
    title: "UI/UX & 2D Design",
    icon: "💻",
    desc: "Learning and exploring modern UI/UX and 2D design principles.",
    color: "#FF6FB7",
  },
];

function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

function SkillBar({ name, level, delay }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className="skill-item" style={{ animationDelay: `${delay}ms` }}>
      <div className="skill-label">
        <span>{name}</span>
        <span className="skill-percent">{level}%</span>
      </div>
      <div className="skill-track">
        <div
          className="skill-fill"
          style={{ width: inView ? `${level}%` : "0%", transitionDelay: `${delay + 200}ms` }}
        />
      </div>
    </div>
  );
}

function Section({ children, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} className={`section ${inView ? "visible" : ""} ${className}`}>
      {children}
    </section>
  );
}

function SpiderWeb({ heroRef }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const nodesRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const heroElement = heroRef.current;
    
    // Set canvas size to match hero section
    const updateCanvasSize = () => {
      if (heroElement) {
        canvas.width = heroElement.offsetWidth;
        canvas.height = heroElement.offsetHeight;
      }
    };
    updateCanvasSize();

    // Initialize nodes with random positions
    if (nodesRef.current.length === 0) {
      for (let i = 0; i < 50; i++) {
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
        });
      }
    }

    const handleMouseMove = (e) => {
      if (heroElement) {
        const rect = heroElement.getBoundingClientRect();
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodesRef.current.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off walls
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));
      });

      // Draw lines between nearby nodes
      const connectionDistance = 150;
      nodesRef.current.forEach((node, i) => {
        nodesRef.current.forEach((other, j) => {
          if (i < j) {
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
              const opacity = 1 - distance / connectionDistance;
              const isCloseToCursor = 
                Math.abs(node.x - mouseRef.current.x) < 200 &&
                Math.abs(node.y - mouseRef.current.y) < 200;

              ctx.strokeStyle = isCloseToCursor 
                ? `rgba(255, 111, 183, ${opacity * 0.6})`
                : `rgba(26, 58, 107, ${opacity * 0.4})`;
              ctx.lineWidth = 0.5;
              ctx.shadowBlur = 8;
              ctx.shadowColor = isCloseToCursor 
                ? 'rgba(255, 111, 183, 0.5)'
                : 'rgba(26, 58, 107, 0.3)';
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          }
        });
      });

      // Draw glowing lines from cursor to nearest nodes
      const cursorConnectionDistance = 250;
      nodesRef.current.forEach((node) => {
        const dx = node.x - mouseRef.current.x;
        const dy = node.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < cursorConnectionDistance) {
          const opacity = 1 - distance / cursorConnectionDistance;
          ctx.strokeStyle = `rgba(255, 111, 183, ${opacity * 0.7})`;
          ctx.lineWidth = 1;
          ctx.shadowBlur = 12;
          ctx.shadowColor = 'rgba(255, 111, 183, 0.7)';
          ctx.beginPath();
          ctx.moveTo(mouseRef.current.x, mouseRef.current.y);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();
        }
      });

      ctx.shadowBlur = 0;
      animationRef.current = requestAnimationFrame(draw);
    };

    window.addEventListener('mousemove', handleMouseMove);
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (heroElement) resizeObserver.observe(heroElement);

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [heroRef]);

  return <canvas ref={canvasRef} className="spider-web-canvas" />;
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="app">
      {/* Floating blobs */}
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />

      {/* Navbar */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-logo">JS<span>.</span></div>
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          {["home", "about", "skills", "projects", "contact"].map((s) => (
            <button key={s} onClick={() => scrollTo(s)}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
          ))}
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Hero */}
      <section id="home" className="hero" ref={heroRef}>
        <SpiderWeb heroRef={heroRef} />
        <div className="hero-content">
          <div className="hero-tag animate-in delay-1">✦ Creative Designer</div>
          <h1 className="hero-name animate-in delay-2">
            Jyotshana<br /><span className="pink">Shahi</span>
          </h1>
          <p className="hero-sub animate-in delay-3">
            Graphic Designer · Video Editor · UI/UX Learner
          </p>
          <div className="hero-btns animate-in delay-4">
            <button className="btn-primary" onClick={() => scrollTo("projects")}>View Work</button>
            <button className="btn-outline" onClick={() => scrollTo("contact")}>Contact Me</button>
          </div>
        </div>
        <div className="hero-avatar animate-in delay-2">
          <div className="avatar-ring">
            <div className="avatar-placeholder">
              <img src={profilePhoto} alt="Jyotshana Shahi" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            </div>
          </div>
          <div className="avatar-badge badge1">🎨 Designer</div>
          <div className="avatar-badge badge2">🎬 Editor</div>
        </div>
        <div className="scroll-hint animate-in delay-5">
          <div className="scroll-dot" />
          <span>Scroll down</span>
        </div>
      </section>

      {/* About */}
      <Section className="about-section" >
        <div id="about" className="section-inner about-inner">
          <div className="about-text">
            <div className="section-tag">— About Me</div>
            <h2>Creative &amp; Passionate<br /><span className="pink">Graphic Designer</span></h2>
            <p>
              I'm a creative graphic designer with strong skills in visual design and video editing.
              Looking for an opportunity to apply my creativity using industry tools like Photoshop,
              Illustrator, and Premiere Pro while continuing to grow in UI/UX and motion design.
            </p>
            <div className="about-stats">
              <div className="stat"><strong>B.A.</strong><span>Graduate<br/>2021–2024</span></div>
              <div className="stat-divider" />
              <div className="stat"><strong>2+</strong><span>Years<br/>Experience</span></div>
              <div className="stat-divider" />
              <div className="stat"><strong>7+</strong><span>Tools<br/>Mastered</span></div>
            </div>
          </div>
          <div className="about-cards">
            <div className="info-card">
              <div className="info-icon">📍</div>
              <div><strong>Location</strong><p>Siswa Bazar, Maharajganj</p></div>
            </div>
            <div className="info-card">
              <div className="info-icon">📧</div>
              <div><strong>Email</strong><p>jyotshanashahi13@gmail.com</p></div>
            </div>
            <div className="info-card">
              <div className="info-icon">📞</div>
              <div><strong>Phone</strong><p>9129757973</p></div>
            </div>
            <div className="info-card">
              <div className="info-icon">💼</div>
              <div><strong>Status</strong><p>Open to Opportunities</p></div>
            </div>
          </div>
        </div>
      </Section>

      {/* Skills */}
      <Section className="skills-section">
        <div id="skills" className="section-inner">
          <div className="section-tag center">— My Skills</div>
          <h2 className="center">Tools &amp; <span className="pink">Expertise</span></h2>
          <div className="skills-grid">
            {skills.map((s, i) => (
              <SkillBar key={s.name} name={s.name} level={s.level} delay={i * 100} />
            ))}
          </div>
          <div className="strengths">
            {["Creative Thinking", "Quick Learner", "Attention to Detail", "Good Communication", "Time Management"].map((s) => (
              <span key={s} className="strength-tag">✦ {s}</span>
            ))}
          </div>
        </div>
      </Section>

      {/* Projects */}
      <Section className="projects-section">
        <div id="projects" className="section-inner">
          <div className="section-tag center">— Projects</div>
          <h2 className="center">What I <span className="pink">Create</span></h2>
          <div className="projects-grid">
            {projects.map((p, i) => (
              <div key={p.title} className="project-card" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="project-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <div className="project-glow" style={{ background: p.color }} />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Experience */}
      <Section className="exp-section">
        <div id="experience" className="section-inner">
          <div className="section-tag center">— Experience</div>
          <h2 className="center">Work <span className="pink">History</span></h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-card">
                <div className="timeline-header">
                  <h3>Computer Operator</h3>
                  <span className="badge pink-badge">8 Months</span>
                </div>
                <p className="timeline-company">Hero Agency</p>
                <ul>
                  <li>Handled daily computer tasks and data management.</li>
                  <li>Assisted in office documentation and digital work.</li>
                </ul>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-card">
                <div className="timeline-header">
                  <h3>Computer Operator</h3>
                  <span className="badge blue-badge">1 Year</span>
                </div>
                <p className="timeline-company">Bajaj Agency</p>
                <ul>
                  <li>Managed system operations and office records.</li>
                  <li>Improved efficiency in digital workflow and data handling.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Contact */}
      <Section className="contact-section">
        <div id="contact" className="section-inner contact-inner">
          <div className="section-tag center">— Contact</div>
          <h2 className="center">Let's <span className="pink">Connect</span></h2>
          <p className="contact-sub">Have a project in mind? Let's create something amazing together.</p>
          <div className="contact-cards">
            <a href="mailto:jyotshanashahi13@gmail.com" className="contact-card">
              <span className="contact-icon">📧</span>
              <span>jyotshanashahi13@gmail.com</span>
            </a>
            <a href="tel:9129757973" className="contact-card">
              <span className="contact-icon">📱</span>
              <span>9129757973</span>
            </a>
            <div className="contact-card">
              <span className="contact-icon">📍</span>
              <span>Siswa Bazar, Maharajganj</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="footer">
        <p>Designed with 💖 by <span className="pink">Jyotshana Shahi</span></p>
        <p className="footer-sub">Graphic Designer · 2024</p>
      </footer>
    </div>
  );
}
