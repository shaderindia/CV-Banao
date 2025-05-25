document.addEventListener('DOMContentLoaded', () => {
    const resumeForm = document.getElementById('resume-form');
    const photoInput = document.getElementById('photo');
    const imageToCrop = document.getElementById('imageToCrop');
    const photoPreviewBox = document.getElementById('photo-preview-box');
    const photoPlaceholder = document.getElementById('photo-placeholder');
    const cropButton = document.getElementById('crop-button');
    const resetFormBtn = document.getElementById('reset-form-btn');
    const downloadPdfBtn = document.getElementById('download-pdf');
    const resumeOutput = document.getElementById('resume-output');
    const resumeContent = document.getElementById('resume-content');

    let cropper = null;
    let croppedImageDataUrl = null;

    // Handle photo upload and Cropper initialization
    photoInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imageToCrop.src = e.target.result;
                imageToCrop.style.display = 'block';
                photoPlaceholder.style.display = 'none';
                
                if (cropper) {
                    cropper.destroy();
                }
                cropper = new Cropper(imageToCrop, {
                    aspectRatio: 1, // Square crop for profile photos
                    viewMode: 1,    // Restrict crop box to canvas
                    dragMode: 'move',
                    background: false,
                    autoCropArea: 0.8,
                    // responsive: true, // Handled by CSS for preview box
                    // checkCrossOrigin: false // If loading external images
                    ready: function () {
                        // By default, CropperJS sets the container to the size of the image.
                        // We want it to fit into our preview box.
                        // This requires the preview box to have explicit dimensions.
                        // And overflow:hidden on photo-preview-box.
                    }
                });
                cropButton.style.display = 'inline-block';
            };
            reader.readAsDataURL(files[0]);
        }
    });

    // Handle crop button click
    cropButton.addEventListener('click', () => {
        if (cropper) {
            const canvas = cropper.getCroppedCanvas({
                width: 200, // Desired output width
                height: 200, // Desired output height
                imageSmoothingQuality: 'high',
            });
            croppedImageDataUrl = canvas.toDataURL('image/png'); // Or image/jpeg
            
            // Update the preview in the box with the cropped image
            // (optional, as it's already visually cropped)
            // imageToCrop.src = croppedImageDataUrl; 
            // cropper.destroy(); // Destroy cropper after crop
            // cropButton.style.display = 'none'; // Hide crop button after crop

            alert('Image cropped! It will be used in the resume.');
        }
    });

    // Handle form submission
    resumeForm.addEventListener('submit', (event) => {
        event.preventDefault();
        generateResume();
        resumeOutput.style.display = 'block';
        // Smooth scroll to resume preview
        resumeOutput.scrollIntoView({ behavior: 'smooth' });
    });

    // Handle reset form
    resetFormBtn.addEventListener('click', () => {
        resumeForm.reset();
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        imageToCrop.src = '';
        imageToCrop.style.display = 'none';
        photoPlaceholder.style.display = 'flex'; // Show placeholder
        cropButton.style.display = 'none';
        croppedImageDataUrl = null;
        resumeOutput.style.display = 'none';
        resumeContent.innerHTML = ''; // Clear previous resume
    });

    // Handle PDF download
    downloadPdfBtn.addEventListener('click', ()_ => {
        if (resumeContent.innerHTML.trim() === "") {
            alert("Please generate the resume first!");
            return;
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'p', // portrait
            unit: 'mm',       // millimeters
            format: 'a4',     // A4 format
            putOnlyUsedFonts:true,
            floatPrecision: 16 // or "smart", default is 16
        });
        
        // html2canvas options
        const canvasOptions = {
            scale: 2, // Higher scale for better quality
            useCORS: true, // If images are from other domains
            logging: true,
            width: resumeContent.offsetWidth, // Use actual width of content
            height: resumeContent.offsetHeight, // Use actual height of content
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight
        };

        html2canvas(resumeContent, canvasOptions).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            // Calculate the image dimensions to fit the PDF page
            const canvasAspectRatio = canvas.width / canvas.height;
            const pdfAspectRatio = pdfWidth / pdfHeight;

            let imgPdfWidth = pdfWidth;
            let imgPdfHeight = pdfHeight;

            if (canvasAspectRatio > pdfAspectRatio) { // Canvas is wider than PDF page
                imgPdfHeight = pdfWidth / canvasAspectRatio;
            } else { // Canvas is taller or same aspect ratio
                imgPdfWidth = pdfHeight * canvasAspectRatio;
            }
            
            // Center the image on the PDF page (optional)
            const x = (pdfWidth - imgPdfWidth) / 2;
            const y = 0; // (pdfHeight - imgPdfHeight) / 2; // Start from top

            pdf.addImage(imgData, 'PNG', x, y, imgPdfWidth, imgPdfHeight);
            pdf.save('resume.pdf');
        }).catch(err => {
            console.error("Error generating PDF:", err);
            alert("Sorry, an error occurred while generating the PDF.");
        });
    });

    // Function to generate resume HTML
    function generateResume() {
        const data = {
            fullName: document.getElementById('full-name').value,
            designation: document.getElementById('designation').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            photo: croppedImageDataUrl || '', // Use cropped image or empty
            
            maritalStatus: document.getElementById('marital-status').value,
            birthDate: document.getElementById('birth-date').value,
            gender: document.getElementById('gender').value,
            
            objective: document.getElementById('objective').value.replace(/\n/g, '<br>'),
            education: document.getElementById('education').value.replace(/\n/g, '<br>'),
            skills: document.getElementById('skills').value.replace(/\n/g, '<br>'),
            experience: document.getElementById('experience').value.replace(/\n/g, '<br>'),
            cadCamSoftware: document.getElementById('cadcam-software').value.replace(/\n/g, '<br>'),
            languages: document.getElementById('languages').value.replace(/\n/g, '<br>'),
            declaration: document.getElementById('declaration').value.replace(/\n/g, '<br>')
        };

        // Simple Two-Column Resume Template Structure
        let html = `
            <div class="resume-header">
                ${data.photo ? `<img src="${data.photo}" alt="Profile Photo" class="resume-photo">` : ''}
                <h1>${data.fullName || 'Your Name'}</h1>
                <p>${data.designation || 'Your Designation'}</p>
            </div>

            <div class="resume-body">
                <div class="resume-sidebar-column">
                    <div class="resume-section resume-contact-info">
                        <h2>Contact</h2>
                        ${data.phone ? `<p><i class="fas fa-phone"></i> ${data.phone}</p>` : ''}
                        ${data.email ? `<p><i class="fas fa-envelope"></i> ${data.email}</p>` : ''}
                        ${data.address ? `<p><i class="fas fa-map-marker-alt"></i> ${data.address}</p>` : ''}
                    </div>

                    ${(data.maritalStatus || data.birthDate || data.gender) ? `
                    <div class="resume-section resume-personal-details">
                        <h2>Personal Details</h2>
                        ${data.birthDate ? `<p><i class="fas fa-calendar-alt"></i> ${new Date(data.birthDate).toLocaleDateString()}</p>` : ''}
                        ${data.gender ? `<p><i class="fas fa-venus-mars"></i> ${data.gender}</p>` : ''}
                        ${data.maritalStatus ? `<p><i class="fas fa-ring"></i> ${data.maritalStatus}</p>` : ''}
                    </div>` : ''}

                    ${data.skills ? `
                    <div class="resume-section">
                        <h2>Skills</h2>
                        <p>${data.skills}</p> 
                    </div>` : ''}
                    
                    ${data.cadCamSoftware ? `
                    <div class="resume-section">
                        <h2>CAD/CAM Software</h2>
                        <p>${data.cadCamSoftware}</p>
                    </div>` : ''}

                    ${data.languages ? `
                    <div class="resume-section">
                        <h2>Languages</h2>
                        <p>${data.languages}</p>
                    </div>` : ''}
                </div>

                <div class="resume-main-column">
                    ${data.objective ? `
                    <div class="resume-section">
                        <h2>Objective / Summary</h2>
                        <p>${data.objective}</p>
                    </div>` : ''}

                    ${data.experience ? `
                    <div class="resume-section">
                        <h2>Experience</h2>
                        <p>${data.experience}</p>
                    </div>` : ''}
                    
                    ${data.education ? `
                    <div class="resume-section">
                        <h2>Education</h2>
                        <p>${data.education}</p>
                    </div>` : ''}
                </div>
            </div>
            
            ${data.declaration ? `
            <div class="resume-section declaration-preview" style="margin-top: 20px; text-align: center; font-style: italic; font-size: 9pt;">
                <p>${data.declaration}</p>
            </div>` : ''}
        `;

        resumeContent.innerHTML = html;
    }
});
