from enum import Enum

class StaffRoles(str, Enum):
    TEACHER = "Teacher"
    ADMIN = "Admin"


class StudentStatuses(str, Enum):
    REGISTERED = "Registered"
    ENROLLED = "Enrolled"
    BLOCKED = "Blocked"


class PreRegistrationStatuses(str, Enum):
    PENDING_APPROVAL = "PendingApproval"
    APPROVED = "Approved"

class CertificateStatuses(str, Enum):
    IN_PROGRESS = "In progress"
    ISSUED = "Issued"