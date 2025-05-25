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

    let cropper; // Cropper.js instance
    let croppedPhotoDataUrl = ''; // Stores the data URL of the cropped image

    // ... (Suggestion Data Map and Suggestion Box Logic - NO CHANGES) ...

    // --- Photo Handling with Cropper.js ---
    photoPreviewBox.addEventListener('click', () => {
        photoInput.click(); // Trigger hidden file input click
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

            // Set the preview image to the cropped version
            imageToCrop.src = croppedPhotoDataUrl;
            imageToCrop.style.display = 'block';
            photoPlaceholder.style.display = 'none';
            cropButton.style.display = 'none';
            cropper.destroy(); // Destroy cropper instance
        } else {
            alert('Please select a photo first to crop.');
        }
    });


    // --- Resume Generation ---
    resumeForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // ... (All data collection from form fields - NO CHANGES) ...

        // Helper function to format multi-line text into paragraphs or list items
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

        // Construct the resume HTML with a two-column layout
        // IMPORTANT: The img tag should always be present, even if src is empty,
        // and its display property handled by CSS.
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


                ${skills ? `<h2 class="resume-section-title">Skills</h2>${formatText(skills)}` : ''}
                ${languages ? `<h2 class="resume-section-title">Languages</h2>${formatText(languages)}` : ''}
                ${software ? `<h2 class="resume-section-title">Software</h2>${formatText(software)}` : ''}
            </div>

            <div class="main-content">
                ${objective ? `<h2 class="resume-section-title">Objective</h2>${formatText(objective)}` : ''}
                ${experience ? `<h2 class="resume-section-title">Experience</h2>${formatText(experience)}` : ''}
                ${education ? `<h2 class="resume-section-title">Education</h2>${formatText(education)}` : ''}
                ${declaration ? `<p class="declaration-text">${declaration}</p>` : ''}
            </div>
        `;

        resumeContent.classList.add('two-column-layout');
        resumeOutput.style.display = 'block';
        resumeOutput.scrollIntoView({ behavior: 'smooth' });
    });

    // --- PDF Download Functionality ---
    downloadPdfBtn.addEventListener('click', async () => { // Made the function async
        // Show the resume content in the visible DOM for html2canvas
        // We'll hide other elements via CSS before html2canvas capture
        resumeOutput.style.display = 'block';
        resumeContent.style.position = 'static'; // Ensure it's in normal flow
        resumeContent.style.left = 'auto'; // Reset left
        resumeContent.style.visibility = 'visible'; // Ensure it's visible

        // Function to wait for image to load
        const loadImage = (imgElement) => {
            return new Promise((resolve, reject) => {
                if (!imgElement || !imgElement.src) { // No image or no src
                    return resolve();
                }
                if (imgElement.complete) { // Image already loaded
                    return resolve();
                }
                imgElement.onload = resolve;
                imgElement.onerror = reject;
            });
        };

        // Wait for the profile photo to load (if present)
        const profilePhotoElement = resumeContent.querySelector('.profile-photo-resume');
        try {
            if (profilePhotoElement && croppedPhotoDataUrl) {
                await loadImage(profilePhotoElement);
                console.log('Profile photo loaded for PDF capture.');
            }
        } catch (error) {
            console.warn('Error loading profile photo for PDF capture, proceeding anyway:', error);
            // Don't block PDF generation if image fails to load, just log a warning
        }

        // Add a small delay AFTER image is confirmed loaded for DOM to fully render
        // This is crucial for html2canvas
        setTimeout(() => {
            html2canvas(resumeContent, {
                scale: 3, // Increased scale for even better resolution
                useCORS: true,
                logging: true,
                allowTaint: true,
                backgroundColor: '#ffffff', // Explicitly set background color for canvas
                scrollX: 0, // Ensure starting from top-left
                scrollY: 0,
                windowWidth: resumeContent.scrollWidth,  // Capture full width
                windowHeight: resumeContent.scrollHeight, // Capture full height
            }).then(canvas => {
                const { jsPDF } = window.jspdf;
                const imgData = canvas.toDataURL('image/jpeg', 1.0);

                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                });

                const imgWidth = 210; // A4 width in mm
                const pageHeight = 297; // A4 height in mm
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

                // Reset styles after capture
                resumeContent.style.display = 'block'; // Keep it visible for the user preview
                resumeContent.style.position = '';
                resumeContent.style.left = '';
                resumeContent.style.visibility = ''; // Reset visibility

            }).catch(error => {
                console.error('Error generating PDF:', error);
                alert('Could not generate PDF. Please try again or check console for errors.');
                // Reset styles in case of error
                resumeContent.style.display = 'block';
                resumeContent.style.position = '';
                resumeContent.style.left = '';
                resumeContent.style.visibility = '';
            });
        }, 50); // Small delay after image load for final DOM rendering
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
