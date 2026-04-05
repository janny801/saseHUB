const resourceData = {
  behavioral: {
    title: "Behavioral Interviews",
    icon: "fa-seedling",
    content: `
      <h3>Preparation</h3>
      <ul>
        <li>Practice months ahead</li>
        <li>Use the STAR method</li>
        <li>Practice at least 1 hour per week</li>
      </ul>
      <h3>Day-of Tips</h3>
      <ul>
        <li>Do energizing activities</li>
        <li>Eat before your interview</li>
        <li>Join a few minutes early</li>
      </ul>`
  },
  technical: {
    title: "Technical Interviews",
    icon: "fa-gear",
    content: `
      <h3>Preparation Steps</h3>
      <ul>
        <li>Study job posting & required skills</li>
        <li>Practice algorithms / data structures</li>
        <li>Review your resume projects</li>
        <li>Research the company</li>
        <li>Do mock interviews</li>
      </ul>
      <h3>Helpful Resources</h3>
      <ul>
        <li>LeetCode, HackerRank, CodeForces</li>
        <li>Books: CTCI, EPI, DDIA</li>
      </ul>`
  },
  coffee: {
    title: "Coffee Chat 101",
    icon: "fa-mug-hot",
    content: `
      <h3>What is a Coffee Chat?</h3>
      <p>An informal networking meeting between students and professionals.</p>
      <h3>Benefits</h3>
      <ul>
        <li>Strengthen current connections</li>
        <li>Reestablish old connections</li>
        <li>Make new connections</li>
        <li>Learn about opportunities</li>
      </ul>
      <h3>Tips</h3>
      <ul>
        <li>Take initiative</li>
        <li>Prepare questions ahead of time</li>
        <li>Arrive early</li>
        <li>Follow up afterward</li>
      </ul>
      <h3>Good Questions to Ask</h3>
      <ul>
        <li>How did you get started?</li>
        <li>What do you enjoy about your role?</li>
        <li>What challenges do you face?</li>
        <li>What skills matter most in your field?</li>
        <li>What advice do you have for beginners?</li>
      </ul>`
  },
  cover: {
    title: "Cover Letters & Emails",
    icon: "fa-envelope",
    content: `
      <h3>Purpose</h3>
      <p>Explain your fit, value, and motivation for the role.</p>
      <h3>Steps</h3>
      <ol>
        <li>Research company values</li>
        <li>Match job posting skills</li>
        <li>Select strongest stories to highlight</li>
      </ol>
      <h3>Email Tips</h3>
      <ul>
        <li>Use meaningful subject lines</li>
        <li>Be clear and concise</li>
        <li>Clarify assumptions</li>
        <li>Keep communication professional</li>
      </ul>`
  },
  resume: {
    title: "Building a Resume",
    icon: "fa-file-lines",
    content: `
      <h3>Rules</h3>
      <ul>
        <li>1 page maximum</li>
        <li>Simple, clean, easy formatting</li>
        <li>Sections ordered by relevance</li>
        <li>Items listed reverse chronologically</li>
        <li>Your resume evolves — keep improving it</li>
        <li>Save as PDF with a clean filename</li>
      </ul>
      <h3>Recommended Resume Sections</h3>
      <ol>
        <li>Education</li>
        <li>Skills & Certifications</li>
        <li>Experience</li>
        <li>Projects</li>
        <li>Activities / Leadership</li>
      </ol>
      <h3>Google XYZ Formula</h3>
      <p><strong>“Accomplished X by implementing Y which led to Z.”</strong></p>
      <h3>Outlining Achievements</h3>
      <ul>
        <li>Put strongest bullets first</li>
        <li>Show concrete impact</li>
        <li>Quantify results when possible</li>
        <li>Use concise 1–2 line bullets</li>
      </ul>
      <h3>Describing Experience</h3>
      <ul>
        <li><strong>Project/Product:</strong> What it is + the problem it solves</li>
        <li><strong>Role:</strong> What you contributed / challenges solved</li>
        <li><strong>Achievements:</strong> Use XYZ formula</li>
        <li><strong>Tech stack:</strong> e.g., Java, Python, Git, Jenkins</li>
      </ul>
      <h3>Resume Template (PDF Preview)</h3>
      <iframe src="pagesfiles/recruitmccombs-bba-resume-template.pdf" style="width: 100%; height: 520px; border: 1px solid #66b3ff; border-radius: 6px; margin-top: 12px;"></iframe>`
  },
  linkedin: {
    title: "Creating a LinkedIn",
    icon: "fa-brands fa-linkedin",
    content: `
      <h3>Profile</h3>
      <ul>
        <li>Use a recent, well-lit photo</li>
        <li>Choose a professional header image</li>
        <li>Add GitHub / portfolio to Featured</li>
      </ul>
      <h3>Experience</h3>
      <ul>
        <li>Re-use resume bullets</li>
        <li>Attach relevant media</li>
      </ul>
      <h3>Education</h3>
      <ul>
        <li>Include activities and relevant training</li>
      </ul>
      <h3>Certifications</h3>
      <ul>
        <li>Add key certificates (e.g., CodePath)</li>
      </ul>
      <h3>Skills</h3>
      <ul>
        <li>Pin top 3 relevant skills</li>
      </ul>
      <h3>Volunteer Experience</h3>
      <p>Great for demonstrating impact even without paid work.</p>
      <h3>Recommendations</h3>
      <p>Ask mentors or supervisors for one strong recommendation.</p>`
  },
  tips: {
    title: "Tips & Tricks",
    icon: "fa-lightbulb",
    content: `
      <h3>Networking Tips</h3>
      <ul>
        <li>Ask politely</li>
        <li>Follow up within 48 hours</li>
        <li>Mention your referrer</li>
      </ul>
      <h3>Online Communication Tips</h3>
      <ul>
        <li>Use meaningful subject lines</li>
        <li>Be clear and concise</li>
        <li>Verify assumptions</li>
        <li>Communicate how you will communicate</li>
      </ul>`
  },
  goals: {
    title: "Setting & Achieving Goals",
    icon: "fa-trophy",
    content: `
      <h3>Setting & Achieving Goals</h3>
      <p>
        Setting goals can help you feel more fulfilled and achieve greater success in your professional life.
        These goals may be short- or long-term objectives that you aim to achieve on a daily, monthly, or yearly basis.
        Whether you want to complete a significant project or pursue a new career, setting clear objectives can help you
        track your progress and reach major milestones.
      </p>
      <h3>Short-Term vs Long-Term Goals</h3>
      <ul>
        <li><strong>Short-term:</strong> Achievable soon and support long-term goals.</li>
        <li><strong>Long-term:</strong> Multi-year goals built from short-term steps.</li>
      </ul>
      <h3>Benefits of Setting Goals</h3>
      <ul>
        <li>Guides your career direction</li>
        <li>Helps maintain focus</li>
        <li>Makes large projects manageable</li>
        <li>Supports long-term advancement</li>
      </ul>
      <h3>SMART Goals</h3>
      <img src="../pages/pagesfiles/smart_goals_template.jpg" alt="SMART Goals Template" style="width:100%; max-width:700px; border-radius:8px; margin:10px 0;"/>
      <p>
        SMART stands for <strong>Specific, Measurable, Achievable, Relevant, Time-based</strong>.
        These guidelines help ensure your goals are realistic and trackable.
      </p>
      <h3>Tips for Setting Professional Goals</h3>
      <ul>
        <li>Be realistic about your time and abilities</li>
        <li>Share your goals with friends or mentors for accountability</li>
        <li>Acknowledge your progress regularly</li>
      </ul>`
  },
  conference: {
    title: "Conference Prep",
    icon: "fa-briefcase",
    content: `
      <h3>Hospitality Suites</h3>
      <ul>
        <li>Great chance to earn interviews</li>
        <li>20–30 companies typically present</li>
        <li>Bring multiple resumes</li>
      </ul>
      <h3>Networking</h3>
      <ul>
        <li>Talk to presenters after workshops</li>
        <li>Approach high-level managers confidently</li>
      </ul>
      <h3>Interview Experience</h3>
      <p>Preparation helps reduce stress and increase success at SASE National.</p>`
  }
};

function openModal(key) {
  const data = resourceData[key];
  if (!data) return;

  const modal = document.getElementById("resourceModal");
  const title = document.getElementById("modalTitle");
  const icon = document.getElementById("modalIcon");
  const body = document.getElementById("modalBody");

  title.innerText = data.title;
  icon.className = `fa-solid ${data.icon}`;
  body.innerHTML = data.content;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden"; 
}

function closeModal() {
  const modal = document.getElementById("resourceModal");
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

window.onclick = function(event) {
  const modal = document.getElementById("resourceModal");
  if (event.target === modal) {
    closeModal();
  }
};