import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabase';
import { AuthenticatedRequest, User } from '../types';

export interface AuthError extends Error {
  statusCode: number;
}

// Middleware для проверки аутентификации
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Проверяем JWT токен через Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Получаем профиль пользователя из базы данных
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({
        success: false,
        error: 'User profile not found'
      });
    }

    // Проверяем, активен ли пользователь
    if (!profile.is_active) {
      return res.status(401).json({
        success: false,
        error: 'User account is deactivated'
      });
    }

    // Добавляем пользователя в request
    req.user = profile as User;
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authentication'
    });
  }
};

// Middleware для проверки ролей
export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware для проверки, является ли пользователь администратором
export const requireAdmin = authorize(['admin']);

// Middleware для проверки, является ли пользователь менеджером или администратором
export const requireManager = authorize(['admin', 'manager']);

// Middleware для проверки, является ли пользователь владельцем ресурса
export const requireOwnership = (resourceType: string, userIdField = 'user_id') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

      // Проверяем, является ли пользователь администратором (администраторы имеют доступ ко всему)
      if (req.user.role === 'admin') {
        return next();
      }

      // Получаем ресурс из базы данных
      const { data: resource, error } = await supabase
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

      // Проверяем владельца
      if (resource[userIdField] !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: you are not the owner of this resource'
        });
      }

      next();
      
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error during ownership check'
      });
    }
  };
};

// Middleware для проверки доступа к проекту
export const requireProjectAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
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

    // Администраторы имеют доступ ко всем проектам
    if (req.user.role === 'admin') {
      return next();
    }

    // Проверяем доступ к проекту через политики RLS
    const { data: project, error } = await supabase
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

    // Менеджер проекта имеет полный доступ
    if (project.manager_id === req.user.id) {
      return next();
    }

    // Проверяем, участвует ли пользователь в проекте (через задачи, этапы, учет времени)
    const { data: participation, error: participationError } = await supabase
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
      // Проверяем через этапы проекта
      const { data: stageParticipation } = await supabase
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
    
  } catch (error) {
    console.error('Project access check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during project access check'
    });
  }
};

// Middleware для валидации JWT токена без проверки пользователя (для публичных эндпоинтов)
export const validateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile && profile.is_active) {
          req.user = profile as User;
        }
      }
    }
    
    next();
    
  } catch (error) {
    // Игнорируем ошибки валидации токена для публичных эндпоинтов
    next();
  }
};

// Middleware для проверки активности пользователя
export const requireActiveUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  if (!req.user.is_active) {
    return res.status(403).json({
      success: false,
      error: 'User account is deactivated'
    });
  }

  next();
};