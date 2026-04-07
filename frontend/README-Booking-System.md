# Smart Campus Booking System - Member 2 Implementation

## Overview
This is the frontend implementation for Module B - Booking Management workflow as part of the IT3030 PAF Assignment. This component provides a complete booking workflow system with modern UI/UX design.

## Features Implemented

### ✅ Core Features (Member 2 Responsibilities)

#### 1. Booking Request Form
- **Resource Selection**: Dynamic dropdown with active resources
- **Date & Time Picker**: Intuitive scheduling with conflict detection
- **Purpose Input**: Rich text description with validation
- **Attendee Count**: Optional field with capacity validation
- **Real-time Conflict Detection**: Automatic checking for scheduling conflicts
- **Form Validation**: Comprehensive validation using Zod schema

#### 2. Booking List & Management
- **Advanced Filtering**: Status, resource type, date range, and search
- **Responsive Design**: Mobile-friendly card layout
- **Status Indicators**: Visual badges with icons for different statuses
- **Quick Actions**: Approve/Reject buttons for admins
- **Sorting**: Chronological ordering with creation/update timestamps

#### 3. Admin Approval Interface
- **Bulk Actions**: Approve/reject pending bookings
- **Rejection Reasons**: Modal for detailed rejection feedback
- **Real-time Updates**: Instant status updates without page refresh
- **Conflict Prevention**: Built-in validation prevents double-booking

#### 4. Booking Workflow Visualization
- **Status Pipeline**: Visual representation of booking lifecycle
- **Progress Tracking**: Clear indication of current booking status
- **Timeline View**: Creation and update timestamps
- **Status History**: Complete audit trail of status changes

#### 5. Conflict Detection System
- **Real-time Validation**: Instant feedback during form completion
- **Visual Warnings**: Clear error messages for scheduling conflicts
- **Prevention Logic**: Blocks submission of conflicting bookings
- **Resource Availability**: Shows conflicting bookings details

## Technical Implementation

### 🛠 Technology Stack
- **React 19** with TypeScript for type safety
- **Tailwind CSS** for modern, responsive styling
- **React Hook Form** with Zod validation
- **Axios** for API communication
- **Heroicons** for consistent iconography
- **Date-fns** for date manipulation

### 📁 Component Structure
```
src/
├── components/booking/
│   ├── BookingForm.tsx          # Booking request form with validation
│   ├── BookingList.tsx          # Filterable booking list
│   ├── AdminBookingActions.tsx  # Admin approve/reject actions
│   └── BookingWorkflow.tsx      # Status visualization
├── pages/
│   └── BookingPage.tsx          # Main booking page container
├── services/
│   └── bookingApi.ts            # API service layer
└── types/
    └── booking.ts               # TypeScript type definitions
```

### 🔌 API Integration
The system is designed to work with a Spring Boot backend with the following endpoints:

#### Resource Management
- `GET /api/resources` - Fetch all active resources

#### Booking Operations
- `GET /api/bookings` - Get all bookings (admin)
- `GET /api/bookings/user/{userId}` - Get user bookings
- `POST /api/bookings` - Create new booking
- `POST /api/bookings/check-conflicts` - Check for scheduling conflicts
- `PATCH /api/bookings/{id}/approve` - Approve booking (admin)
- `PATCH /api/bookings/{id}/reject` - Reject booking (admin)
- `PATCH /api/bookings/{id}/cancel` - Cancel booking
- `GET /api/bookings/{id}` - Get booking details

### 🎨 UI/UX Features

#### Modern Design System
- **Consistent Color Palette**: Primary blue theme with semantic colors
- **Responsive Layout**: Mobile-first design approach
- **Micro-interactions**: Hover states, transitions, and loading indicators
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML

#### User Experience
- **Progressive Disclosure**: Show relevant information based on user role
- **Real-time Feedback**: Instant validation and conflict detection
- **Intuitive Navigation**: Clear breadcrumbs and action buttons
- **Error Handling**: Graceful error states with helpful messages

## Booking Workflow States

### 📋 Status Flow
1. **PENDING** → Initial state after booking request
2. **APPROVED** → Admin approval granted
3. **REJECTED** → Admin rejection with reason
4. **CANCELLED** → User cancellation (approved bookings only)

### 🔐 Role-based Access
- **USER**: Can create, view, and cancel their own bookings
- **ADMIN**: Can view all bookings, approve/reject requests
- **TECHNICIAN**: Read-only access (extendable for future features)

## Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run start

# Build for production
npm run build
```

## Backend Integration Notes

### Database Schema (Expected)
```sql
-- Resources table
CREATE TABLE resources (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'),
    capacity INT,
    location VARCHAR(255) NOT NULL,
    status ENUM('ACTIVE', 'OUT_OF_SERVICE') DEFAULT 'ACTIVE'
);

-- Bookings table
CREATE TABLE bookings (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    resource_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose TEXT NOT NULL,
    expected_attendees INT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') DEFAULT 'PENDING',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id)
);
```

### Validation Rules
- **Time Validation**: End time must be after start time
- **Date Validation**: Cannot book in the past
- **Conflict Prevention**: No overlapping bookings for same resource
- **Capacity Check**: Expected attendees cannot exceed resource capacity
- **Status Transitions**: Enforce proper workflow state changes

## Testing

### Component Testing
The components are designed for easy testing with React Testing Library:

```bash
# Run tests (when implemented)
npm test
```

### Manual Testing Checklist
- [ ] Create new booking with valid data
- [ ] Attempt booking with conflicting time (should show error)
- [ ] Filter bookings by status, type, and date
- [ ] Admin approve/reject workflow
- [ ] User cancel approved booking
- [ ] View booking details and workflow status
- [ ] Responsive design on mobile devices

## Future Enhancements

### Potential Extensions
- **Calendar View**: Monthly/weekly booking visualization
- **Recurring Bookings**: Support for recurring reservations
- **Email Notifications**: Automated status update emails
- **Booking Analytics**: Usage statistics and reports
- **QR Code Check-in**: Digital verification system
- **Waitlist System**: Automatic booking from waitlist

### Performance Optimizations
- **Virtual Scrolling**: For large booking lists
- **Caching**: Resource and booking data caching
- **Lazy Loading**: Component-level code splitting
- **Optimistic Updates**: Instant UI updates with rollback

## Contribution Guidelines

### Code Style
- Follow TypeScript strict mode guidelines
- Use Tailwind CSS for styling (no inline styles)
- Implement proper error boundaries
- Maintain consistent naming conventions

### Git Workflow
- Create feature branches for new components
- Use descriptive commit messages
- Ensure all tests pass before merging
- Update documentation for API changes

## Support

For issues related to this booking system implementation:
1. Check the browser console for error messages
2. Verify API endpoints are accessible
3. Ensure backend is running and database is configured
4. Review network tab in browser dev tools for API responses

---

**Member 2 Implementation Complete** ✅  
This implementation satisfies all Module B requirements and provides a solid foundation for the Smart Campus Operations Hub booking system.
