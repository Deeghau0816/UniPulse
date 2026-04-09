import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService, type TicketPriority, type TicketCategory } from '../services/ticketService';

type FormDataState = {
  category: TicketCategory | '';
  location: string;
  priority: TicketPriority | '';
  preferredContact: string;
  description: string;
};

type AttachmentItem = {
  file: File;
  name: string;
  size: string;
  preview: string;
};

type FormErrors = {
  category?: string;
  location?: string;
  priority?: string;
  preferredContact?: string;
  description?: string;
  attachments?: string;
};

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<FormDataState>({
    category: '',
    location: '',
    priority: '',
    preferredContact: '',
    description: '',
  });

  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const categoryOptions: TicketCategory[] = [
    'Electrical',
    'IT Support',
    'Mechanical',
    'Lab Equipment',
  ];

  const priorityOptions: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
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

  const validateFiles = (files: File[]): string[] => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024;
    const fileErrors: string[] = [];

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
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

    const mappedFiles: AttachmentItem[] = selectedFiles.map((file) => ({
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

  const removeAttachment = (indexToRemove: number): void => {
    setAttachments((prev) => {
      const removed = prev[indexToRemove];
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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

  const handleCancel = (): void => {
    navigate('/dashboard/my-tickets');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitMessage('');

    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const ticketRequest = {
        category: formData.category as TicketCategory,
        location: formData.location,
        priority: formData.priority as TicketPriority,
        description: formData.description,
        preferredContact: formData.preferredContact,
        createdBy: 'Current User', // You can update this with actual user data
      };

      const createdTicket = await ticketService.createTicket(ticketRequest);
      
      console.log('Created ticket:', createdTicket);
      setSubmitMessage('Incident ticket submitted successfully!');

      // Reset form
      setFormData({
        category: '',
        location: '',
        priority: '',
        preferredContact: '',
        description: '',
      });

      // Clean up attachments
      attachments.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });

      setAttachments([]);
      setErrors({});
      setIsSubmitting(false);

      // Navigate to tickets page after a short delay
      setTimeout(() => {
        navigate('/dashboard/my-tickets');
      }, 1500);
      
    } catch (error) {
      console.error('Failed to create ticket:', error);
      
      // Show more detailed error information
      let errorMessage = 'Failed to submit ticket. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Backend server is not responding. Please check if backend is running on http://localhost:8081';
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Network connection failed. Please check your internet connection';
        } else if (error.message.includes('HTTP error')) {
          errorMessage = `Server error occurred: ${error.message}`;
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error occurred. Please check the form data and try again.';
        }
      }
      
      setSubmitMessage(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: #ffffff;
        }

        .create-ticket-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background:
            radial-gradient(circle at 10% 12%, rgba(249, 115, 22, 0.12), transparent 22%),
            radial-gradient(circle at 88% 18%, rgba(251, 146, 60, 0.12), transparent 20%),
            radial-gradient(circle at 82% 82%, rgba(24, 24, 27, 0.08), transparent 24%),
            linear-gradient(135deg, #ffffff 0%, #fafafa 48%, #fff7ed 100%);
          color: #111111;
        }

        .create-ticket-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(17, 17, 17, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(17, 17, 17, 0.03) 1px, transparent 1px);
          background-size: 38px 38px;
          animation: gridFloat 18s ease-in-out infinite;
          pointer-events: none;
          opacity: 0.55;
        }

        @keyframes gridFloat {
          0% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(8px, 8px, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }

        .accent-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          opacity: 0.42;
        }

        .blob-1 {
          width: 340px;
          height: 340px;
          background: rgba(249, 115, 22, 0.18);
          top: -110px;
          left: -90px;
        }

        .blob-2 {
          width: 320px;
          height: 320px;
          background: rgba(251, 146, 60, 0.16);
          bottom: -100px;
          right: -70px;
        }

        .page-header {
          padding: 72px 72px 28px;
          position: relative;
          z-index: 2;
        }

        .header-content {
          max-width: 1180px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
        }

        .page-title {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 10px;
          color: #111111;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          font-size: 15px;
          line-height: 1.8;
          color: #52525b;
          max-width: 760px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .header-btn {
          padding: 13px 16px;
          border-radius: 14px;
          border: 1px solid #d4d4d8;
          background: #ffffff;
          color: #111111;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .header-btn:hover {
          background: #fafafa;
        }

        .form-section {
          padding: 0 72px 72px;
          position: relative;
          z-index: 2;
        }

        .form-container {
          max-width: 1180px;
          margin: 0 auto;
        }

        .form-card {
          background: rgba(255,255,255,0.92);
          border: 1px solid #e4e4e7;
          border-radius: 24px;
          padding: 30px;
          box-shadow: 0 12px 28px rgba(0,0,0,0.05);
        }

        .section-title {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ea580c;
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
          color: #111111;
        }

        .input,
        .select,
        .textarea {
          width: 100%;
          border-radius: 14px;
          border: 1px solid #d4d4d8;
          background: #ffffff;
          color: #111111;
          padding: 14px 16px;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .input::placeholder,
        .textarea::placeholder {
          color: #71717a;
        }

        .input:focus,
        .select:focus,
        .textarea:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.12);
        }

        .textarea {
          min-height: 160px;
          resize: vertical;
          line-height: 1.7;
        }

        .hint-text {
          font-size: 12px;
          color: #71717a;
          line-height: 1.6;
        }

        .error-text {
          font-size: 12px;
          color: #dc2626;
          line-height: 1.5;
        }

        .upload-box {
          background: #fafafa;
          border: 1.5px dashed #f97316;
          border-radius: 20px;
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
          color: #111111;
          margin-bottom: 6px;
        }

        .upload-text {
          font-size: 14px;
          line-height: 1.7;
          color: #52525b;
        }

        .upload-btn {
          border: none;
          border-radius: 12px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: #ffffff;
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
          background: #ffffff;
          border: 1px solid #e4e4e7;
          border-radius: 18px;
          padding: 12px;
          box-shadow: 0 6px 16px rgba(0,0,0,0.04);
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
          color: #111111;
          margin-bottom: 4px;
          word-break: break-word;
        }

        .preview-size {
          font-size: 12px;
          color: #71717a;
          margin-bottom: 10px;
        }

        .remove-btn {
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 10px 12px;
          background: #18181b;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .remove-btn:hover {
          background: #27272a;
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
          border-radius: 14px;
          padding: 14px 20px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .secondary-btn {
          background: #ffffff;
          color: #111111;
          border: 1px solid #d4d4d8;
        }

        .secondary-btn:hover {
          background: #fafafa;
        }

        .primary-btn {
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: #ffffff;
          box-shadow: 0 10px 24px rgba(249, 115, 22, 0.20);
        }

        .primary-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .primary-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .success-message {
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 14px;
          background: #fff7ed;
          border: 1px solid #fdba74;
          color: #c2410c;
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
            padding: 52px 24px 20px;
          }

          .form-section {
            padding: 0 24px 48px;
          }

          .page-title {
            font-size: 34px;
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
        <div className="accent-blob blob-1" />
        <div className="accent-blob blob-2" />

        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">Create Incident Ticket</h1>
              <p className="page-subtitle">
                Submit a new maintenance or incident report for a campus room, lab,
                facility, or equipment item. You can upload up to 3 images as evidence.
              </p>
            </div>

            <div className="header-actions">
              <button className="header-btn" onClick={() => navigate('/dashboard/my-tickets')}>
                My Tickets
              </button>
              <button className="header-btn" onClick={() => navigate('/dashboard/notifications')}>
                Notifications
              </button>
            </div>
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