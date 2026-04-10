import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceService, type ResourceRequest } from '../services/resourceService';

const AddResourcePage = () => {
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ResourceRequest>({
    name: '',
    type: 'LECTURE_HALL',
    capacity: undefined,
    location: '',
    description: '',
    availabilityWindows: '',
    status: 'ACTIVE',
    imageUrl: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'capacity') {
      setFormData({
        ...formData,
        [name]: value ? parseInt(value) || undefined : undefined,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.location || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setIsSaving(true);
      const response = await resourceService.createResource(formData);
      setError(null);
      navigate(`/dashboard/resources/${response.id}`);
    } catch (err) {
      console.error('Failed to create resource:', err);
      setError('Failed to create resource. Please try again.');
    } finally {
      setIsSaving(false);
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

        .add-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background:
            radial-gradient(circle at 10% 12%, rgba(249, 115, 22, 0.15), transparent 25%),
            radial-gradient(circle at 88% 18%, rgba(251, 146, 60, 0.12), transparent 22%),
            radial-gradient(circle at 82% 82%, rgba(24, 24, 27, 0.06), transparent 28%),
            radial-gradient(circle at 45% 55%, rgba(249, 115, 22, 0.08), transparent 30%),
            linear-gradient(135deg, #ffffff 0%, #fafafa 45%, #fff7ed 100%);
          color: #111111;
        }

        .add-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(17, 17, 17, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(17, 17, 17, 0.025) 1px, transparent 1px);
          background-size: 42px 42px;
          animation: gridFloat 20s ease-in-out infinite;
          pointer-events: none;
          opacity: 0.45;
        }

        @keyframes gridFloat {
          0% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(10px, 10px, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }

        .accent-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          opacity: 0.5;
          animation: blobFloat 12s ease-in-out infinite;
        }

        .blob-1 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(251, 146, 60, 0.15));
          top: -140px;
          left: -120px;
          animation-delay: 0s;
        }

        .blob-2 {
          width: 380px;
          height: 380px;
          background: linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(249, 115, 22, 0.12));
          bottom: -120px;
          right: -100px;
          animation-delay: -4s;
        }

        .blob-3 {
          width: 280px;
          height: 280px;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.18), rgba(251, 146, 60, 0.1));
          top: 50%;
          right: 10%;
          animation-delay: -8s;
        }

        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.05); }
          66% { transform: translate(-15px, 15px) scale(0.95); }
        }

        .page-header {
          padding: 72px 72px 28px;
          position: relative;
          z-index: 2;
        }

        .header-content {
          max-width: 1360px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .page-title {
          font-size: 46px;
          font-weight: 800;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #111111 0%, #52525b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.03em;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .primary-btn,
        .secondary-btn {
          padding: 16px 22px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .primary-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .primary-btn:hover::before {
          opacity: 1;
        }

        .primary-btn {
          border: none;
          background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%);
          color: #ffffff;
          box-shadow: 
            0 4px 14px rgba(249, 115, 22, 0.3),
            0 0 0 1px rgba(249, 115, 22, 0.1) inset;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 8px 24px rgba(249, 115, 22, 0.35),
            0 0 0 1px rgba(249, 115, 22, 0.15) inset;
        }

        .primary-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .secondary-btn {
          border: 1.5px solid #e4e4e7;
          background: rgba(255,255,255,0.95);
          color: #111111;
          box-shadow: 0 4px 14px rgba(0,0,0,0.04);
        }

        .secondary-btn:hover {
          background: #ffffff;
          border-color: #fdba74;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(249, 115, 22, 0.12);
        }

        .form-section {
          padding: 0 72px 72px;
          position: relative;
          z-index: 2;
        }

        .form-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .form-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%);
          border: 1.5px solid rgba(228, 228, 231, 0.8);
          border-radius: 24px;
          padding: 36px;
          box-shadow: 
            0 4px 20px rgba(0,0,0,0.06),
            0 0 0 1px rgba(255,255,255,0.5) inset;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 26px;
          margin-bottom: 26px;
        }

        .form-group {
          margin-bottom: 22px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #52525b;
          margin-bottom: 12px;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 16px 18px;
          border-radius: 16px;
          border: 1.5px solid #e4e4e7;
          background: #ffffff;
          color: #111111;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          border-color: #f97316;
          box-shadow: 
            0 0 0 4px rgba(249, 115, 22, 0.15),
            0 4px 12px rgba(249, 115, 22, 0.1);
        }

        .form-textarea {
          min-height: 120px;
          resize: vertical;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #a1a1aa;
        }

        .required-mark {
          color: #dc2626;
          margin-left: 2px;
        }

        .error-message {
          padding: 18px;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border: 1.5px solid #fecaca;
          border-radius: 14px;
          color: #991b1b;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
        }

        .helper-text {
          font-size: 12px;
          color: #71717a;
          margin-top: 8px;
          font-weight: 500;
        }

        .image-preview {
          margin-top: 12px;
          border-radius: 14px;
          overflow: hidden;
          border: 1.5px solid #e4e4e7;
          background: #fafafa;
        }

        .preview-image {
          width: 100%;
          height: 250px;
          object-fit: cover;
          display: block;
        }

        .preview-label {
          padding: 10px 14px;
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          font-size: 12px;
          font-weight: 600;
          color: #52525b;
          text-align: center;
          border-top: 1px solid #e4e4e7;
        }

        @media (max-width: 1280px) {
          .page-header,
          .form-section {
            padding-left: 40px;
            padding-right: 40px;
          }
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 52px 24px 20px;
          }

          .form-section {
            padding-left: 24px;
            padding-right: 24px;
          }

          .page-title {
            font-size: 34px;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="add-page">
        <div className="accent-blob blob-1" />
        <div className="accent-blob blob-2" />
        <div className="accent-blob blob-3" />

        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Add New Resource</h1>

            <div className="header-actions">
              <button className="secondary-btn" onClick={() => navigate('/dashboard/resources')}>
                ← Back to Catalogue
              </button>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-container">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form className="form-card" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">
                    Resource Name <span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Main Lecture Hall A"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Resource Type <span className="required-mark">*</span>
                  </label>
                  <select
                    name="type"
                    className="form-select"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="LAB">Lab</option>
                    <option value="MEETING_ROOM">Meeting Room</option>
                    <option value="EQUIPMENT">Equipment</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Capacity (Optional)</label>
                  <input
                    type="number"
                    name="capacity"
                    className="form-input"
                    value={formData.capacity || ''}
                    onChange={handleInputChange}
                    placeholder="Enter capacity"
                    min="1"
                  />
                  <div className="helper-text">Leave empty for equipment items</div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    Location <span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    className="form-input"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Building 3, Floor 2"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    Description <span className="required-mark">*</span>
                  </label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the resource, its features, and any special requirements..."
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    Availability Windows <span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    name="availabilityWindows"
                    className="form-input"
                    value={formData.availabilityWindows}
                    onChange={handleInputChange}
                    placeholder="e.g., Mon-Fri 8AM-10PM, Sat 9AM-5PM"
                    required
                  />
                  <div className="helper-text">Specify when this resource is available for booking</div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Status <span className="required-mark">*</span>
                  </label>
                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="OUT_OF_SERVICE">Out of Service</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Image URL (Optional)</label>
                  <input
                    type="url"
                    name="imageUrl"
                    className="form-input"
                    value={formData.imageUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://example.com/resource-image.jpg"
                  />
                  <div className="helper-text">Add a photo URL to display the resource image in the customer view</div>
                  {formData.imageUrl && (
                    <div className="image-preview">
                      <img src={formData.imageUrl} alt="Preview" className="preview-image" />
                      <div className="preview-label">Image Preview</div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px' }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => navigate('/dashboard/resources')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={isSaving}
                >
                  {isSaving ? 'Creating...' : 'Create Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddResourcePage;
