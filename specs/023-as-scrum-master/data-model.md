# Data Model: Sprint Update Feature

## Sprint Entity
```typescript
interface Sprint {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'active' | 'completed';
  ceremonyTimes: {
    dailyScrum: number;    // minutes, required > 0
    sprintPlanning: number; // minutes, required > 0
    sprintReview: number;   // minutes, required > 0
    sprintRetrospective: number; // minutes, required > 0
  };
  squadId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Validation Rules

### Date Validation
- For active sprints: new dates must be >= current system date
- startDate must be before endDate
- Dates cannot be changed for completed sprints

### Ceremony Time Validation
- All ceremony times must be > 0 (no zeros)
- No blank/null values allowed
- Values represent minutes

### Status Validation
- planned → active → completed (one-way transitions)
- Completed sprints cannot be modified

## State Transitions
```
planned → active    (allowed)
active → completed  (allowed)
active → planned    (not allowed - would violate date constraints)
completed → *       (not allowed - immutable)
```

## Relationships
- Sprint belongs to Squad (one Scrum Master per squad)
- No concurrent update conflicts due to 1:1 squad:scrum-master relationship