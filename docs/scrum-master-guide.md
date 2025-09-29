# Scrum Master Guide

This guide provides comprehensive instructions for Scrum Masters on how to use the sprintCap application to manage sprints and squads effectively.

## Overview

sprintCap is a tool designed to help Scrum Masters create and manage sprints with automatic squad member population. The application ensures that all active squad members are automatically added to new sprints, eliminating manual assignment tasks.

## Getting Started

### Prerequisites
- You must have a Scrum Master role in the system
- You should have at least one squad assigned to you
- Ensure your squad has active members

### Accessing the Application
1. Log in to sprintCap using your credentials
2. Navigate to the admin dashboard
3. Access sprint management features

## Creating a Sprint

### Basic Sprint Creation

1. **Navigate to Sprint Creation**
   - From the admin dashboard, click "Create Sprint" or navigate to `/admin`
   - You'll see a form with sprint creation fields

2. **Fill in Sprint Details**
   - **Sprint Name**: Choose a descriptive name (e.g., "Sprint 2025-10", "Q4 Planning Sprint")
   - **Squad Selection**: Select the squad for which you're creating the sprint
   - **Start Date**: Choose the sprint start date and time
   - **End Date**: Choose the sprint end date and time

3. **Date Considerations**
   - Sprints cannot overlap with existing sprints in the same squad
   - Start date must be before end date
   - Business days are recommended for sprint boundaries
   - Consider time zones when setting exact times

4. **Submit the Sprint**
   - Click "Create Sprint"
   - The system will automatically populate the sprint with all active squad members
   - You'll receive confirmation with sprint details

### Automatic Member Population

When you create a sprint, sprintCap automatically:
- Identifies all active members of the selected squad
- Creates sprint member entries for each active squad member
- Ensures no manual member assignment is required

**Note**: Only active squad members are added. Inactive members must be reactivated at the squad level before they appear in new sprints.

## Managing Sprints

### Viewing Sprint List

1. **Access Sprint List**
   - Navigate to the sprints section
   - View all sprints across your squads

2. **Filtering Options**
   - **By Squad**: Filter sprints for specific squads
   - **By Status**: View active, upcoming, or completed sprints
   - **Pagination**: Navigate through large lists of sprints

### Sprint Details

1. **View Sprint Information**
   - Click on any sprint to view detailed information
   - See sprint dates, squad information, and member list

2. **Member Management**
   - View all sprint members with their details
   - See join dates and contact information
   - Members are automatically managed - no manual additions needed

## Best Practices

### Sprint Planning
- **Consistent Naming**: Use consistent naming conventions (e.g., "Sprint YYYY-MM")
- **Standard Duration**: Plan for 2-week sprints where possible
- **Buffer Time**: Include buffer time between sprints for planning and retrospectives

### Squad Management
- **Regular Updates**: Keep squad membership up to date
- **Member Status**: Ensure member active/inactive status is current
- **Role Clarity**: Maintain clear Scrum Master ownership of squads

### Date Management
- **Business Days**: Align sprint boundaries with business days
- **Time Zones**: Consider team distribution when setting times
- **Holiday Planning**: Account for holidays and team availability

## Troubleshooting

### Common Issues

#### Sprint Creation Fails
- **Permission Denied**: Ensure you have Scrum Master role and own the squad
- **Date Overlap**: Check for conflicting sprint dates in the same squad
- **Invalid Dates**: Ensure start date is before end date
- **Squad Not Found**: Verify the squad exists and you have access

#### Members Not Appearing
- **Inactive Members**: Check if squad members are marked as active
- **Squad Membership**: Verify members are properly assigned to the squad
- **Timing**: New members added after sprint creation won't be automatically included

#### Access Issues
- **Authentication**: Ensure you're logged in with proper credentials
- **Role Verification**: Confirm your Scrum Master role is active
- **Squad Ownership**: Verify you own the squad you're trying to manage

### Getting Help
- Check the API documentation for technical details
- Review application logs for error details
- Contact system administrators for account or permission issues

## API Usage

For advanced users or integration needs, sprintCap provides REST API endpoints:

### Creating Sprints via API
```bash
curl -X POST "http://localhost:3000/api/sprints" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "API Sprint 2025-10",
    "squadId": "squad-123",
    "startDate": "2025-10-01T09:00:00Z",
    "endDate": "2025-10-15T17:00:00Z"
  }'
```

### Listing Sprints via API
```bash
curl "http://localhost:3000/api/sprints?status=active&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

See the API documentation for complete endpoint details and examples.

## Security Considerations

- Sprint data is secured and only accessible to authorized users
- Scrum Masters can only manage sprints for squads they own
- All API calls require proper authentication
- Sensitive data is encrypted in transit and at rest

## Performance Notes

- Sprint creation is optimized for quick response (< 500ms typical)
- Large squads (20+ members) are handled efficiently
- Concurrent operations are supported
- The system maintains performance under load

---

*This guide is for sprintCap version 1.0. Features and interfaces may change in future versions.*