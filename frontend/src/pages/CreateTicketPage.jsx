import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    category: '',
    location: '',
    priority: '',
    preferredContact: '',
    description: '',
  });

  const [attachments, setAttachments] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = [
    'Electrical',
    'IT Support',
    'Mechanical',
    'Lab Equipment',
  ];

  const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const validateFiles = (files) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024;
    const fileErrors = [];

    files.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        fileErrors.push(`${file.name} is not a supported image type.`);
      }

      if (file.size > maxSize) {
        fileErrors.push(`${file.name} exceeds the 2MB limit.`);
      }
    });

    return fileErrors;
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const totalFiles = attachments.length + selectedFiles.length;

    if (totalFiles > 3) {
      setErrors((prev) => ({
        ...prev,
        attachments: 'You can upload a maximum of 3 images only.',
      }));
      return;
    }

    const fileErrors = validateFiles(selectedFiles);

    if (fileErrors.length > 0) {
      setErrors((prev) => ({
        ...prev,
        attachments: fileErrors.join(' '),
      }));
      return;
    }

    const mappedFiles = selectedFiles.map((file) => ({
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
      preview: URL.createObjectURL(file),
    }));

    setAttachments((prev) => [...prev, ...mappedFiles]);

    setErrors((prev) => ({
      ...prev,
      attachments: '',
    }));

    e.target.value = '';
  };

  const removeAttachment = (indexToRemove) => {
    setAttachments((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = 'Category is required.';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location / resource is required.';
    }

    if (!formData.priority) {
      newErrors.priority = 'Priority is required.';
    }

    if (!formData.preferredContact.trim()) {
      newErrors.preferredContact = 'Preferred contact is required.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required.';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    navigate('/dashboard/my-tickets');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitMessage('');

    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);

    setTimeout(() => {
      console.log('Submitted ticket data:', formData);
      console.log('Submitted attachments:', attachments);

      setSubmitMessage('Incident ticket submitted successfully.');

      setFormData({
        category: '',
        location: '',
        priority: '',
        preferredContact: '',
        description: '',
      });

     setAttachments([]);
  setErrors({});
  setIsSubmitting(false);

  setTimeout(() => {
    navigate('/dashboard/my-tickets');
  }, 1000);
}, 1200);
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        .create-ticket-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #111827 45%, #1e1b4b 100%);
          position: relative;
          overflow-x: hidden;
          color: white;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
          opacity: 0.75;
        }

        .orb-1 {
          width: 460px;
          height: 460px;
          background: rgba(59, 130, 246, 0.22);
          top: -140px;
          left: -120px;
        }

        .orb-2 {
          width: 420px;
          height: 420px;
          background: rgba(139, 92, 246, 0.22);
          bottom: -140px;
          right: -100px;
        }

        .page-header {
          padding: 80px 72px 32px;
          position: relative;
          z-index: 2;
        }

        .header-content {
          max-width: 1280px;
          margin: 0 auto;
        }

        .page-title {
          font-size: 46px;
          font-weight: 800;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #ffffff 0%, #dbeafe 50%, #c4b5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-subtitle {
          font-size: 16px;
          line-height: 1.7;
          color: rgba(219, 234, 254, 0.78);
          max-width: 760px;
        }

        .form-section {
          padding: 0 72px 80px;
          position: relative;
          z-index: 2;
        }

        .form-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .form-card {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(24px);
          border-radius: 28px;
          padding: 30px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
        }

        .section-title {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(191, 219, 254, 0.76);
          margin-bottom: 18px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
          margin-bottom: 26px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .field-group.full {
          grid-column: 1 / -1;
        }

        .label {
          font-size: 14px;
          font-weight: 700;
          color: #dbeafe;
        }

        .input,
        .select,
        .textarea {
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          color: #ffffff;
          padding: 14px 16px;
          font-size: 15px;
          outline: none;
          backdrop-filter: blur(14px);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .input:focus,
        .select:focus,
        .textarea:focus {
          border-color: rgba(96, 165, 250, 0.95);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.18);
        }

        .select option {
          color: #111827;
        }

        .textarea {
          min-height: 160px;
          resize: vertical;
          line-height: 1.7;
        }

        .hint-text {
          font-size: 12px;
          color: rgba(191, 219, 254, 0.62);
          line-height: 1.6;
        }

        .error-text {
          font-size: 12px;
          color: #fca5a5;
          line-height: 1.5;
        }

        .upload-box {
          background: rgba(255,255,255,0.05);
          border: 1.5px dashed rgba(147,197,253,0.38);
          border-radius: 22px;
          padding: 22px;
        }

        .upload-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 16px;
        }

        .upload-title {
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 6px;
        }

        .upload-text {
          font-size: 14px;
          line-height: 1.7;
          color: rgba(219, 234, 254, 0.76);
        }

        .upload-btn {
          border: none;
          border-radius: 14px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: transform 0.2s ease;
        }

        .upload-btn:hover {
          transform: translateY(-1px);
        }

        .preview-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-top: 18px;
        }

        .preview-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px;
          padding: 12px;
        }

        .preview-image {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 14px;
          margin-bottom: 10px;
        }

        .preview-name {
          font-size: 12px;
          font-weight: 700;
          color: #e0f2fe;
          margin-bottom: 4px;
          word-break: break-word;
        }

        .preview-size {
          font-size: 12px;
          color: rgba(191, 219, 254, 0.68);
          margin-bottom: 10px;
        }

        .remove-btn {
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 10px 12px;
          background: rgba(239,68,68,0.16);
          color: #fecaca;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .remove-btn:hover {
          background: rgba(239,68,68,0.24);
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 14px;
          margin-top: 28px;
        }

        .secondary-btn,
        .primary-btn {
          border: none;
          border-radius: 16px;
          padding: 14px 20px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .secondary-btn {
          background: rgba(255,255,255,0.08);
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.12);
        }

        .secondary-btn:hover {
          background: rgba(255,255,255,0.12);
        }

        .primary-btn {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #ffffff;
          box-shadow: 0 10px 28px rgba(79, 70, 229, 0.28);
        }

        .primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .primary-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .success-message {
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 16px;
          background: rgba(34,197,94,0.16);
          border: 1px solid rgba(134,239,172,0.3);
          color: #bbf7d0;
          font-size: 14px;
          font-weight: 600;
        }

        @media (max-width: 1100px) {
          .page-header,
          .form-section {
            padding-left: 40px;
            padding-right: 40px;
          }

          .preview-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 850px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .upload-top {
            flex-direction: column;
            align-items: stretch;
          }

          .preview-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 56px 24px 24px;
          }

          .form-section {
            padding: 0 24px 56px;
          }

          .page-title {
            font-size: 36px;
          }

          .page-subtitle {
            font-size: 14px;
          }

          .form-card {
            padding: 20px;
          }

          .actions {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="create-ticket-page">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Create Incident Ticket</h1>
            <p className="page-subtitle">
              Submit a new maintenance or incident report for a campus room, lab,
              facility, or equipment item. You can upload up to 3 images as evidence.
            </p>
          </div>
        </div>

        <div className="form-section">
          <div className="form-container">
            <form className="form-card" onSubmit={handleSubmit}>
              <div className="section-title">Ticket Information</div>

              <div className="form-grid">
                <div className="field-group">
                  <label className="label">Category</label>
                  <select
                    className="select"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && <span className="error-text">{errors.category}</span>}
                </div>

                <div className="field-group">
                  <label className="label">Location / Resource</label>
                  <input
                    className="input"
                    type="text"
                    name="location"
                    placeholder="e.g. Lecture Hall A401"
                    value={formData.location}
                    onChange={handleChange}
                  />
                  {errors.location && <span className="error-text">{errors.location}</span>}
                </div>

                <div className="field-group">
                  <label className="label">Priority</label>
                  <select
                    className="select"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="">Select priority</option>
                    {priorityOptions.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                  {errors.priority && <span className="error-text">{errors.priority}</span>}
                </div>

                <div className="field-group">
                  <label className="label">Preferred Contact</label>
                  <input
                    className="input"
                    type="text"
                    name="preferredContact"
                    placeholder="Phone number or email"
                    value={formData.preferredContact}
                    onChange={handleChange}
                  />
                  {errors.preferredContact && (
                    <span className="error-text">{errors.preferredContact}</span>
                  )}
                </div>

                <div className="field-group full">
                  <label className="label">Issue Description</label>
                  <textarea
                    className="textarea"
                    name="description"
                    placeholder="Describe the issue clearly. Mention what happened, where it happened, how urgent it is, and any visible damage or impact."
                    value={formData.description}
                    onChange={handleChange}
                  />
                  <span className="hint-text">
                    Minimum 20 characters. Be clear enough for the technician/admin to understand the issue.
                  </span>
                  {errors.description && <span className="error-text">{errors.description}</span>}
                </div>

                <div className="field-group full">
                  <label className="label">Image Attachments</label>

                  <div className="upload-box">
                    <div className="upload-top">
                      <div>
                        <div className="upload-title">Upload Evidence Images</div>
                        <div className="upload-text">
                          Add up to 3 images showing the issue. Supported formats: JPG, PNG, WEBP.
                          Maximum size per file: 2MB.
                        </div>
                      </div>

                      <button
                        type="button"
                        className="upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload Images
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      multiple
                      hidden
                      onChange={handleFileChange}
                    />

                    {errors.attachments && (
                      <div className="error-text">{errors.attachments}</div>
                    )}

                    {attachments.length > 0 && (
                      <div className="preview-grid">
                        {attachments.map((item, index) => (
                          <div className="preview-card" key={`${item.name}-${index}`}>
                            <img
                              src={item.preview}
                              alt={item.name}
                              className="preview-image"
                            />
                            <div className="preview-name">{item.name}</div>
                            <div className="preview-size">{item.size} MB</div>
                            <button
                              type="button"
                              className="remove-btn"
                              onClick={() => removeAttachment(index)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>

              {submitMessage && (
                <div className="success-message">{submitMessage}</div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateTicketPage;