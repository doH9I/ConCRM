"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireActiveUser = exports.validateToken = exports.requireProjectAccess = exports.requireOwnership = exports.requireManager = exports.requireAdmin = exports.authorize = exports.authenticate = void 0;
const supabase_1 = require("../utils/supabase");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'Authorization header is required'
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Token is required'
            });
            return;
        }
        const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user) {
            res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
            return;
        }
        const { data: profile, error: profileError } = await supabase_1.supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (profileError || !profile) {
            res.status(401).json({
                success: false,
                error: 'User profile not found'
            });
            return;
        }
        req.user = {
            id: user.id,
            email: user.email || '',
            ...profile
        };
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};
exports.authenticate = authenticate;
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: 'Insufficient permissions'
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
exports.requireAdmin = (0, exports.authorize)(['admin']);
exports.requireManager = (0, exports.authorize)(['admin', 'manager']);
const requireOwnership = (resourceType, userIdField = 'user_id') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }
            const resourceId = req.params.id;
            if (!resourceId) {
                return res.status(400).json({
                    success: false,
                    error: 'Resource ID is required'
                });
            }
            if (req.user.role === 'admin') {
                return next();
            }
            const { data: resource, error } = await supabase_1.supabase
                .from(resourceType)
                .select(userIdField)
                .eq('id', resourceId)
                .single();
            if (error) {
                return res.status(404).json({
                    success: false,
                    error: 'Resource not found'
                });
            }
            if (resource[userIdField] !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied: you are not the owner of this resource'
                });
            }
            next();
        }
        catch (error) {
            console.error('Ownership check error:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error during ownership check'
            });
        }
    };
};
exports.requireOwnership = requireOwnership;
const requireProjectAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        const projectId = req.params.projectId || req.body.project_id || req.query.project_id;
        if (!projectId) {
            return res.status(400).json({
                success: false,
                error: 'Project ID is required'
            });
        }
        if (req.user.role === 'admin') {
            return next();
        }
        const { data: project, error } = await supabase_1.supabase
            .from('projects')
            .select('id, manager_id')
            .eq('id', projectId)
            .single();
        if (error || !project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found or access denied'
            });
        }
        if (project.manager_id === req.user.id) {
            return next();
        }
        const { data: participation, error: participationError } = await supabase_1.supabase
            .from('tasks')
            .select('id')
            .eq('project_id', projectId)
            .eq('assigned_to', req.user.id)
            .limit(1);
        if (participationError) {
            return res.status(500).json({
                success: false,
                error: 'Error checking project participation'
            });
        }
        if (!participation || participation.length === 0) {
            const { data: stageParticipation } = await supabase_1.supabase
                .from('project_stages')
                .select('id')
                .eq('project_id', projectId)
                .eq('responsible_id', req.user.id)
                .limit(1);
            if (!stageParticipation || stageParticipation.length === 0) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied: you are not a participant in this project'
                });
            }
        }
        next();
    }
    catch (error) {
        console.error('Project access check error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error during project access check'
        });
    }
};
exports.requireProjectAccess = requireProjectAccess;
const validateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
            if (!error && user) {
                const { data: profile } = await supabase_1.supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (profile && profile.is_active) {
                    req.user = profile;
                }
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.validateToken = validateToken;
const requireActiveUser = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'User not authenticated'
        });
        return;
    }
    if ('is_active' in req.user && !req.user.is_active) {
        res.status(403).json({
            success: false,
            error: 'User account is inactive'
        });
        return;
    }
    next();
};
exports.requireActiveUser = requireActiveUser;
//# sourceMappingURL=auth.js.map