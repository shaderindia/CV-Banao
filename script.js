document.addEventListener('DOMContentLoaded', () => {
    const resumeForm = document.getElementById('resume-form');
    const photoInput = document.getElementById('photo');
    const photoPreviewBox = document.getElementById('photo-preview-box');
    const imageToCrop = document.getElementById('imageToCrop');
    const photoPlaceholder = document.getElementById('photo-placeholder');
    const cropButton = document.getElementById('crop-button');
    const resumeOutput = document.getElementById('resume-output');
    const resumeContent = document.getElementById('resume-content');
    const downloadPdfBtn = document.getElementById('download-pdf');
    const resetFormBtn = document.getElementById('reset-form-btn');
    const suggestionBox = document.getElementById('suggestion-box');

    let cropper;
    let croppedPhotoDataUrl = '';

    // --- Suggestion Data Map ---
    const suggestions = {
        'full-name': 'Enter your full legal name as you want it to appear on your resume. This is typically at the top.',
        'designation': 'Your current or target job title, such as "Software Engineer," "Marketing Manager," or "Graphic Designer." Be specific!',
        'email': 'Provide a professional email address (e.g., yourname@email.com). Avoid informal addresses.',
        'phone': 'Include your primary contact phone number, preferably with your country code for international applications (e.g., +1 555-123-4567).',
        'address': 'Your city and state/country are usually sufficient (e.g., New York, NY, USA). A full street address is rarely needed for privacy.',
        'marital-status': 'Select your marital status. This is optional and often excluded from resumes unless legally required or highly relevant to the role/region.',
        'birth-date': 'Your date of birth. This is optional and often omitted from resumes due to privacy concerns and to avoid age discrimination. Consider local regulations.',
        'gender': 'Select your gender. Similar to birth date, this is optional and often excluded for privacy and to prevent discrimination.',
        'objective': 'A concise, impactful summary (2-3 sentences) of your career goals and what unique value you bring to a role. Tailor it to each job application!',
        'education': 'List all relevant educational achievements. For each entry: Degree, University, City, State/Country, and Graduation Date (or expected date). Start with your most recent degree. Example: "M.Sc. Computer Science, University of XYZ, London, UK, 2023."',
        'experience': 'Detail your work history. For each role: Job Title, Company Name, City, State/Country, and Dates (e.g., "Software Developer, Tech Solutions Inc., New York, 2021 - Present"). Use strong action verbs and quantify your achievements with numbers and results. Example: "- Managed backend systems, improving data processing speed by 25% and reducing errors by 10%."',
        'skills': 'Highlight both technical skills (programming languages, software, tools) and soft skills (communication, leadership, problem-solving). Use bullet points or comma-separated lists for clarity. Example: "Python, JavaScript, React, SQL, AWS, Project Management, Team Leadership."',
        'languages': 'List all languages you speak and your proficiency level (e.g., "English (Fluent)", "Spanish (Conversational)", "French (Basic)").',
        'software': 'Mention specific software, tools, and platforms you are proficient in that are relevant to the jobs you\'re applying for. Example: "Microsoft Office Suite, Adobe Creative Cloud, Salesforce, JIRA, Figma, AutoCAD."',
        'declaration': 'A standard declaration statement. You can use the default or customize it. It usually affirms the truthfulness of the information provided.',
        'photo': 'Upload a professional headshot. Ensure it\'s a clear, well-lit image with a neutral background. Cropping to a circle is recommended for a modern look.'
    };

    // --- Suggestion Box Logic ---
    const formElements = resumeForm.querySelectorAll('input, textarea, select');
    formElements.forEach(element => {
        element.addEventListener('focus', () => {
            let id = element.id;
            // Handle photo input specifically
            if (element.type === 'file' && element.id === 'photo') {
                id = 'photo';
            }

            const suggestionText = suggestions[id];
            if (suggestionText) {
                suggestionBox.innerHTML = suggestionText.replace(/\n/g, '<br>');
                suggestionBox.classList.add('show');

                const rect = element.getBoundingClientRect();
                const containerRect = resumeForm.getBoundingClientRect(); // Get container's rect for positioning

                // Calculate position relative to the container for better stability
                let topPos = rect.top - containerRect.top + element.offsetHeight + 10;
                let leftPos = rect.left - containerRect.left;

                // Adjust if it goes off screen to the right
                const viewportWidth = window.innerWidth;
                const suggestionBoxWidth = suggestionBox.offsetWidth || 350; // Use default if not rendered yet
                const margin = 20; // 20px margin from viewport edges

                // Calculate element's right edge relative to the viewport
                const elementRightViewport = rect.right;

                if (elementRightViewport + suggestionBoxWidth > viewportWidth - margin) {
                    // If it overflows right, align its right edge with the element's right edge
                    // and then offset by its width to the left.
                    leftPos = (rect.right - containerRect.left) - suggestionBoxWidth;
                    // Ensure it doesn't go off the left side of the container
                    if (leftPos < 0) {
                        leftPos = 0; // Align with container's left edge
                    }
                }

                suggestionBox.style.top = `${topPos}px`;
                suggestionBox.style.left = `${leftPos}px`;
                suggestionBox.style.right = 'auto'; // Reset right in case it was set previously

                // Handle cases where the suggestion box might be below the viewport
                // This is a complex scenario to handle perfectly across all layouts,
                // but for simple forms, positioning relative to the element is usually enough.
            }
        });

        element.addEventListener('blur', () => {
            suggestionBox.classList.remove('show');
        });
    });

    // --- Photo Handling with Cropper.js ---
    photoPreviewBox.addEventListener('click', () => {
        photoInput.click();
    });

    photoInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                imageToCrop.src = e.target.result;
                imageToCrop.style.display = 'block';
                photoPlaceholder.style.display = 'none';

                if (cropper) {
                    cropper.destroy();
                }

                cropper = new Cropper(imageToCrop, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 0.8,
                    responsive: true,
                    background: false,
                });
                cropButton.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    cropButton.addEventListener('click', () => {
        if (cropper) {
            croppedPhotoDataUrl = cropper.getCroppedCanvas({
                width: 200,
                height: 200,
                fillColor: '#fff',
            }).toDataURL('image/jpeg', 0.9);

            imageToCrop.src = croppedPhotoDataUrl;
            imageToCrop.style.display = 'block';
            photoPlaceholder.style.display = 'none';
            cropButton.style.display = 'none';
            cropper.destroy();
        } else {
            alert('Please select a photo first to crop.');
        }
    });


    // --- Resume Generation ---
    resumeForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const fullName = document.getElementById('full-name').value;
        const designation = document.getElementById('designation').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;

        const maritalStatus = document.getElementById('marital-status').value;
        const birthDate = document.getElementById('birth-date').value;
        const gender = document.getElementById('gender').value;

        let age = '';
        if (birthDate) {
            const today = new Date();
            const dob = new Date(birthDate);
            let calculatedAge = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                calculatedAge--;
            }
            age = calculatedAge;
        }

        const objective = document.getElementById('objective').value;
        const education = document.getElementById('education').value;
        const skills = document.getElementById('skills').value;
        const experience = document.getElementById('experience').value;
        const languages = document.getElementById('languages').value;
        const software = document.getElementById('software').value;
        const declaration = document.getElementById('declaration').value;

        const formatText = (text) => {
            if (!text) return '';
            const lines = text.split('\n').filter(line => line.trim() !== '');
            if (lines.length === 0) return '';

            const hasBulletPoints = lines.some(line => line.trim().startsWith('-'));
            if (hasBulletPoints || lines.length > 1) {
                return `<ul>${lines.map(line => `<li>${line.replace(/^- /, '').trim()}</li>`).join('')}</ul>`;
            }
            return `<p>${lines[0].trim()}</p>`;
        };

        // Construct the resume HTML with the new order for sections
        resumeContent.innerHTML = `
            <div class="sidebar">
                <img src="${croppedPhotoDataUrl || ''}" alt="Profile Photo" class="profile-photo-resume">
                <div class="header">
                    <h1>${fullName}</h1>
                    <p>${designation}</p>
                </div>
                <div class="contact-info">
                    ${email ? `<span><i class="fas fa-envelope"></i> ${email}</span>` : ''}
                    ${phone ? `<span><i class="fas fa-phone"></i> ${phone}</span>` : ''}
                    ${address ? `<span><i class="fas fa-map-marker-alt"></i> ${address}</span>` : ''}
                </div>

                <h2 class="resume-section-title">Personal Details</h2>
                <div class="personal-details-block">
                    ${maritalStatus ? `<div><strong>Marital Status:</strong> ${maritalStatus}</div>` : ''}
                    ${birthDate ? `<div><strong>Date of Birth:</strong> ${new Date(birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>` : ''}
                    ${age ? `<div><strong>Age:</strong> ${age}</div>` : ''}
                    ${gender ? `<div><strong>Gender:</strong> ${gender}</div>` : ''}
                </div>
            </div>

            <div class="main-content">
                ${objective ? `<h2 class="resume-section-title">Objective</h2>${formatText(objective)}` : ''}
                ${experience ? `<h2 class="resume-section-title">Experience</h2>${formatText(experience)}` : ''}
                ${education ? `<h2 class="resume-section-title">Education</h2>${formatText(education)}` : ''}
                ${skills ? `<h2 class="resume-section-title">Skills</h2>${formatText(skills)}` : ''}
                ${languages ? `<h2 class="resume-section-title">Languages</h2>${formatText(languages)}` : ''}
                ${software ? `<h2 class="resume-section-title">Software</h2>${formatText(software)}` : ''}
                ${declaration ? `<p class="declaration-text">${declaration}</p>` : ''}
            </div>
        `;

        resumeContent.classList.add('two-column-layout');
        resumeOutput.style.display = 'block';
        resumeOutput.scrollIntoView({ behavior: 'smooth' });
    });

    // --- PDF Download Functionality ---
    downloadPdfBtn.addEventListener('click', async () => {
        resumeOutput.style.display = 'block';
        resumeContent.style.position = 'static';
        resumeContent.style.left = 'auto';
        resumeContent.style.visibility = 'visible';

        const loadImage = (imgElement) => {
            return new Promise((resolve, reject) => {
                if (!imgElement || !imgElement.src) {
                    return resolve();
                }
                if (imgElement.complete) {
                    return resolve();
                }
                imgElement.onload = resolve;
                imgElement.onerror = reject;
            });
        };

        const profilePhotoElement = resumeContent.querySelector('.profile-photo-resume');
        try {
            if (profilePhotoElement && croppedPhotoDataUrl) {
                await loadImage(profilePhotoElement);
                console.log('Profile photo loaded for PDF capture.');
            }
        } catch (error) {
            console.warn('Error loading profile photo for PDF capture, proceeding anyway:', error);
        }

        setTimeout(() => {
            html2canvas(resumeContent, {
                scale: 3,
                useCORS: true,
                logging: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                scrollX: 0,
                scrollY: 0,
                windowWidth: resumeContent.scrollWidth,
                windowHeight: resumeContent.scrollHeight,
            }).then(canvas => {
                const { jsPDF } = window.jspdf;
                const imgData = canvas.toDataURL('image/jpeg', 1.0);

                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                });

                const imgWidth = 210;
                const pageHeight = 297;
                const imgHeight = canvas.height * imgWidth / canvas.width;
                let heightLeft = imgHeight;

                let position = 0;

                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft > 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                pdf.save('your_resume.pdf');

                resumeContent.style.display = 'block';
                resumeContent.style.position = '';
                resumeContent.style.left = '';
                resumeContent.style.visibility = '';

            }).catch(error => {
                console.error('Error generating PDF:', error);
                alert('Could not generate PDF. Please try again or check console for errors.');
                resumeContent.style.display = 'block';
                resumeContent.style.position = '';
                resumeContent.style.left = '';
                resumeContent.style.visibility = '';
            });
        }, 50);
    });

    // --- Reset Form Functionality ---
    resetFormBtn.addEventListener('click', () => {
        resumeForm.reset();
        if (cropper) {
            cropper.destroy();
        }
        imageToCrop.src = '';
        imageToCrop.style.display = 'none';
        photoPlaceholder.style.display = 'block';
        cropButton.style.display = 'none';
        croppedPhotoDataUrl = '';

        resumeOutput.style.display = 'none';
        resumeContent.innerHTML = '';
        resumeContent.classList.remove('two-column-layout');
    });
});
