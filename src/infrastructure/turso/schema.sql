-- ============================================================================
-- RJT NEXUS PEOPLE - Turso Relational Edge SQLite Schema
-- Enforces:
-- 1. UUID-style TEXT primary keys.
-- 2. Mandatory tenant_id partitioning in all business tables.
-- 3. High-integrity FOREIGN KEY constraints.
-- 4. Optimized indexes on tenant_id for low-latency edge queries.
-- ============================================================================

-- Enable foreign key support in SQLite/Turso
PRAGMA foreign_keys = ON;

-- 1. tenants
CREATE TABLE tenants (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- 2. organization_units
CREATE TABLE organization_units (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('department', 'sector', 'division')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_organization_units_tenant ON organization_units(tenant_id);

-- 3. employees
CREATE TABLE employees (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    organization_unit_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_unit_id) REFERENCES organization_units(id) ON DELETE RESTRICT
);
CREATE INDEX idx_employees_tenant ON employees(tenant_id);
CREATE INDEX idx_employees_email ON employees(email);

-- 4. employee_skills (Normalizing nested skills arrays from domain)
CREATE TABLE employee_skills (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    proficiency_level TEXT NOT NULL,
    certified INTEGER NOT NULL DEFAULT 0 CHECK(certified IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
CREATE INDEX idx_employee_skills_tenant ON employee_skills(tenant_id);
CREATE INDEX idx_employee_skills_employee ON employee_skills(employee_id);

-- 5. functions
CREATE TABLE functions (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    organization_unit_id TEXT NOT NULL,
    is_critical INTEGER NOT NULL DEFAULT 0 CHECK(is_critical IN (0, 1)),
    required_backup_quantity INTEGER NOT NULL DEFAULT 2,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_unit_id) REFERENCES organization_units(id) ON DELETE RESTRICT
);
CREATE INDEX idx_functions_tenant ON functions(tenant_id);
CREATE UNIQUE INDEX idx_functions_code_tenant ON functions(code, tenant_id);

-- 6. employee_assignments
CREATE TABLE employee_assignments (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    organization_unit_id TEXT NOT NULL,
    function_id TEXT NOT NULL,
    position_title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'ended')),
    is_primary INTEGER NOT NULL DEFAULT 0 CHECK(is_primary IN (0, 1)),
    start_date TEXT NOT NULL,
    end_date TEXT,
    manager_employee_id TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_unit_id) REFERENCES organization_units(id) ON DELETE RESTRICT,
    FOREIGN KEY (function_id) REFERENCES functions(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_employee_id) REFERENCES employees(id) ON DELETE SET NULL
);
CREATE INDEX idx_employee_assignments_tenant ON employee_assignments(tenant_id);
CREATE INDEX idx_employee_assignments_employee ON employee_assignments(employee_id);

-- 7. critical_function_assessments
CREATE TABLE critical_function_assessments (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    function_id TEXT NOT NULL,
    gut_score INTEGER NOT NULL,
    vulnerability_score INTEGER NOT NULL,
    classification TEXT NOT NULL CHECK(classification IN ('low', 'medium', 'high', 'critical')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (function_id) REFERENCES functions(id) ON DELETE CASCADE
);
CREATE INDEX idx_cf_assessments_tenant ON critical_function_assessments(tenant_id);
CREATE UNIQUE INDEX idx_cf_assessments_function ON critical_function_assessments(function_id);

-- 8. backup_assignments
CREATE TABLE backup_assignments (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    function_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'proposed' CHECK(status IN ('active', 'in_training', 'proposed')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (function_id) REFERENCES functions(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
CREATE INDEX idx_backup_assignments_tenant ON backup_assignments(tenant_id);
CREATE INDEX idx_backup_assignments_function ON backup_assignments(function_id);

-- 9. succession_candidates
CREATE TABLE succession_candidates (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    function_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    readiness_score INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (function_id) REFERENCES functions(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
CREATE INDEX idx_succession_candidates_tenant ON succession_candidates(tenant_id);
CREATE INDEX idx_succession_candidates_function ON succession_candidates(function_id);

-- 10. training_programs
CREATE TABLE training_programs (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_training_programs_tenant ON training_programs(tenant_id);

-- 11. ojt_plans
CREATE TABLE ojt_plans (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned', 'in_progress', 'completed')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
CREATE INDEX idx_ojt_plans_tenant ON ojt_plans(tenant_id);
CREATE INDEX idx_ojt_plans_employee ON ojt_plans(employee_id);

-- 12. knowledge_assets
CREATE TABLE knowledge_assets (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    function_id TEXT NOT NULL,
    last_reviewed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (function_id) REFERENCES functions(id) ON DELETE CASCADE
);
CREATE INDEX idx_knowledge_assets_tenant ON knowledge_assets(tenant_id);
CREATE INDEX idx_knowledge_assets_function ON knowledge_assets(function_id);

-- 13. evidence_records
CREATE TABLE evidence_records (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    function_id TEXT,
    knowledge_asset_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'under_review', 'validated', 'rejected')),
    evidence_url TEXT NOT NULL,
    uploaded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (function_id) REFERENCES functions(id) ON DELETE SET NULL,
    FOREIGN KEY (knowledge_asset_id) REFERENCES knowledge_assets(id) ON DELETE SET NULL
);
CREATE INDEX idx_evidence_records_tenant ON evidence_records(tenant_id);
CREATE INDEX idx_evidence_records_employee ON evidence_records(employee_id);

-- 14. action_plans
CREATE TABLE action_plans (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
    owner_employee_id TEXT,
    function_id TEXT,
    source_type TEXT NOT NULL CHECK(source_type IN ('vulnerability', 'critical_function', 'skill_gap', 'backup_gap', 'succession_gap', 'knowledge_gap', 'evidence_gap')),
    source_record_id TEXT NOT NULL,
    due_date TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (function_id) REFERENCES functions(id) ON DELETE SET NULL
);
CREATE INDEX idx_action_plans_tenant ON action_plans(tenant_id);
CREATE INDEX idx_action_plans_owner ON action_plans(owner_employee_id);

-- 15. import_batches
CREATE TABLE import_batches (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    import_type TEXT NOT NULL CHECK(import_type IN ('employee', 'organization_unit', 'function', 'employee_assignment', 'training_program', 'ojt_plan', 'knowledge_asset', 'evidence_record', 'action_plan')),
    processed_count INTEGER NOT NULL,
    success_count INTEGER NOT NULL,
    error_count INTEGER NOT NULL,
    warning_count INTEGER NOT NULL,
    file_path_r2 TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
CREATE INDEX idx_import_batches_tenant ON import_batches(tenant_id);

-- 16. import_errors
CREATE TABLE import_errors (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    batch_id TEXT NOT NULL,
    row_number INTEGER NOT NULL,
    column_name TEXT,
    message TEXT NOT NULL,
    raw_value TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES import_batches(id) ON DELETE CASCADE
);
CREATE INDEX idx_import_errors_tenant ON import_errors(tenant_id);
CREATE INDEX idx_import_errors_batch ON import_errors(batch_id);

-- 17. import_warnings
CREATE TABLE import_warnings (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    batch_id TEXT NOT NULL,
    row_number INTEGER NOT NULL,
    column_name TEXT,
    message TEXT NOT NULL,
    raw_value TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES import_batches(id) ON DELETE CASCADE
);
CREATE INDEX idx_import_warnings_tenant ON import_warnings(tenant_id);
CREATE INDEX idx_import_warnings_batch ON import_warnings(batch_id);
