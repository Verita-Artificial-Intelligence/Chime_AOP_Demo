# LocalStorage Usage Audit

This document outlines all current localStorage usage in the application and recommendations for which items should be moved to backend APIs.

## Current LocalStorage Usage

### 1. Authentication State
**Files**: `LoginPage.tsx`, `Layout.tsx`, `ProtectedRoute.tsx`
**Keys**: 
- `isAuthenticated` - Boolean flag for login state
- `currentUser` - Username of logged in user

**Recommendation**: 🔴 **MOVE TO BACKEND**
- Should use proper JWT tokens or session-based authentication
- User profile data should come from backend API
- Authentication state should be validated server-side

### 2. Active Workflows (Legacy)
**Files**: `ActiveRunsPage.tsx`, `WorkflowStepsDisplay.tsx`
**Key**: `activeWorkflows`

**Recommendation**: ✅ **ALREADY REPLACED**
- New `ApiActiveWorkflows` component uses backend APIs
- Legacy system kept for backward compatibility
- Can be fully removed once API integration is complete

### 3. API Active Workflows (New)
**Files**: `SOPToAOPPage.tsx`, `ApiActiveWorkflows.tsx`
**Key**: `apiActiveWorkflows`

**Recommendation**: 🟡 **TEMPORARY - MOVE TO BACKEND**
- Currently used as temporary storage until backend endpoint available
- Should be replaced with proper workflow management API
- Need backend endpoints for: list active workflows, create workflow, update status

### 4. Workflow Run History
**Files**: `ActiveRunsPage.tsx`, `WorkflowStepsDisplay.tsx`, `AgentsPage.tsx`
**Keys**: 
- `workflowRunHistory` - Completed workflow runs
- `workflowRunHistory` (RUN_HISTORY_STORAGE_KEY) - Agent page history

**Recommendation**: 🔴 **MOVE TO BACKEND**
- Historical data should be persisted in database
- Need API endpoints for workflow history
- Should support pagination and filtering

### 5. Workflow Customizations
**Files**: `ActiveRunsPage.tsx`, `WorkflowReviewPage.tsx`, `WorkflowStepsDisplay.tsx`
**Key**: `workflow-custom-{templateId}`

**Recommendation**: 🔴 **MOVE TO BACKEND**
- User customizations should be saved per user account
- Should be associated with user profile
- Need API for saving/loading workflow customizations

## Implementation Priority

### High Priority (Critical for Production)
1. **Authentication System** - Replace with proper JWT/session auth
2. **Active Workflows Management** - Complete API integration
3. **Workflow History** - Move to backend database

### Medium Priority
1. **Workflow Customizations** - User-specific customizations API
2. **Remove Legacy Systems** - Clean up old localStorage implementations

### Low Priority
1. **Caching Strategy** - Consider localStorage for performance caching only

## Recommended Backend Endpoints

### Authentication
- `POST /auth/login` - Login with credentials
- `POST /auth/logout` - Logout and invalidate token
- `GET /auth/me` - Get current user profile
- `POST /auth/refresh` - Refresh authentication token

### Workflow Management
- `GET /workflows/active` - List active workflows for user
- `POST /workflows` - Create new workflow
- `PUT /workflows/{id}` - Update workflow status
- `DELETE /workflows/{id}` - Stop/remove workflow
- `GET /workflows/history` - Get workflow history with pagination

### User Preferences
- `GET /user/preferences` - Get user preferences and customizations
- `PUT /user/preferences` - Save user preferences
- `GET /user/workflow-customizations/{templateId}` - Get workflow customizations
- `PUT /user/workflow-customizations/{templateId}` - Save workflow customizations

## Migration Strategy

1. **Phase 1**: Implement authentication APIs and migrate auth system
2. **Phase 2**: Complete active workflow management API integration
3. **Phase 3**: Implement workflow history APIs
4. **Phase 4**: Add user preferences and customizations APIs
5. **Phase 5**: Remove all localStorage dependencies and add proper error handling

## Security Considerations

- All sensitive data currently in localStorage is vulnerable to XSS attacks
- Authentication tokens should use httpOnly cookies when possible
- User data should be encrypted in transit and at rest
- Implement proper session management and timeout handling
