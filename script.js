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

    let cropper; // Cropper.js instance
    let croppedPhotoDataUrl = ''; // Stores the data URL of the cropped image

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
                photoPlaceholder.style.display = 'none'; // Hide placeholder text

                // Destroy previous cropper instance if exists
                if (cropper) {
                    cropper.destroy();
                }

                // Initialize Cropper.js
                cropper = new Cropper(imageToCrop, {
                    aspectRatio: 1, // Square aspect ratio for a profile photo
                    viewMode: 1, // Restrict the crop box to not exceed the canvas
                    autoCropArea: 0.8, // Automatically crop 80% of the image
                    responsive: true,
                    background: false, // Hide the grid background
                    crop(event) {
                        // You can get crop data here if needed for live updates
                    },
                });
                cropButton.style.display = 'block'; // Show crop button
            };
            reader.readAsDataURL(file);
        }
    });

    cropButton.addEventListener('click', () => {
        if (cropper) {
            // Get cropped image as a data URL
            croppedPhotoDataUrl = cropper.getCroppedCanvas({
                width: 200, // Desired width for the photo in the resume
                height: 200, // Desired height
                fillColor: '#fff', // Background color if image is smaller than canvas
            }).toDataURL('image/jpeg', 0.9); // Quality 0.9 for JPEG

            // Display the cropped image back in the preview box
            imageToCrop.src = croppedPhotoDataUrl;
            imageToCrop.style.display = 'block';
            photoPlaceholder.style.display = 'none';
            cropButton.style.display = 'none'; // Hide crop button after cropping

            cropper.destroy(); // Destroy cropper instance after getting cropped image
        } else {
            alert('Please select a photo first to crop.');
        }
    });


    // --- Resume Generation ---
    resumeForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const nameDesignation = document.getElementById('name-designation').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const objective = document.getElementById('objective').value;
        const education = document.getElementById('education').value;
        const skills = document.getElementById('skills').value;
        const experience = document.getElementById('experience').value;
        const languages = document.getElementById('languages').value;
        const software = document.getElementById('software').value;
        const declaration = document.getElementById('declaration').value;

        // Split name and designation if present
        const [fullName, designation] = nameDesignation.includes(' - ') ? nameDesignation.split(' - ') : [nameDesignation, ''];

        // Helper function to format multi-line text into paragraphs or list items
        const formatText = (text) => {
            if (!text) return '';
            const lines = text.split('\n').filter(line => line.trim() !== '');
            if (lines.length === 1 && !lines[0].startsWith('-')) {
                return `<p>${lines[0]}</p>`;
            }
            // If it contains bullet points or multiple lines, format as unordered list
            return `<ul>${lines.map(line => `<li>${line.startsWith('- ') ? line.substring(2) : line}</li>`).join('')}</ul>`;
        };

        // Construct the resume HTML with a two-column layout
        resumeContent.innerHTML = `
            <div class="sidebar">
                ${croppedPhotoDataUrl ? `<img src="${croppedPhotoDataUrl}" alt="Profile Photo" class="profile-photo-resume">` : ''}
                <div class="header">
                    <h1>${fullName}</h1>
                    <p>${designation}</p>
                </div>
                <div class="contact-info">
                    <span><i class="fas fa-envelope"></i> ${email}</span>
                    <span><i class="fas fa-phone"></i> ${phone}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${address}</span>
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

        // Add the two-column layout class to the resume content
        resumeContent.classList.add('two-column-layout');

        resumeOutput.style.display = 'block';
        resumeOutput.scrollIntoView({ behavior: 'smooth' }); // Scroll to output
    });

    // --- PDF Download Functionality ---
    downloadPdfBtn.addEventListener('click', () => {
        // Ensure resumeContent is visible and correctly sized before rendering
        resumeContent.style.display = 'block'; // Make sure it's visible for html2canvas
        resumeContent.style.position = 'absolute'; // Prevent layout shift during capture
        resumeContent.style.left = '-9999px'; // Move off-screen to avoid flickering

        html2canvas(resumeContent, {
            scale: 2, // Increase scale for better resolution in PDF
            useCORS: true, // Needed if you load images from other domains (e.g., Font Awesome)
            logging: true, // Enable logging for debugging
            allowTaint: true // Allow images to be "tainted" for cross-origin issues (might affect security if not careful)
        }).then(canvas => {
            const { jsPDF } = window.jspdf;
            const imgData = canvas.toDataURL('image/jpeg', 1.0); // Convert canvas to JPEG Data URL

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width; // Calculate image height to maintain aspect ratio
            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save('your_resume.pdf');

            // Reset styles after capture
            resumeContent.style.display = '';
            resumeContent.style.position = '';
            resumeContent.style.left = '';

        }).catch(error => {
            console.error('Error generating PDF:', error);
            alert('Could not generate PDF. Please try again or check console for errors.');
            // Reset styles in case of error
            resumeContent.style.display = '';
            resumeContent.style.position = '';
            resumeContent.style.left = '';
        });
    });

    // --- Reset Form Functionality ---
    resetFormBtn.addEventListener('click', () => {
        resumeForm.reset(); // Resets all form fields
        // Reset photo preview
        if (cropper) {
            cropper.destroy();
        }
        imageToCrop.src = '';
        imageToCrop.style.display = 'none';
        photoPlaceholder.style.display = 'block';
        cropButton.style.display = 'none';
        croppedPhotoDataUrl = ''; // Clear stored photo data

        // Hide resume output
        resumeOutput.style.display = 'none';
        resumeContent.innerHTML = ''; // Clear generated content
        resumeContent.classList.remove('two-column-layout'); // Remove template class
    });
});
