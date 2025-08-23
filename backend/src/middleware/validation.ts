import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from './errorHandler';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      throw new ValidationError(errorMessage);
    }

    // Replace req.body with validated data
    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      throw new ValidationError(errorMessage);
    }

    // Replace req.query with validated data
    req.query = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      throw new ValidationError(errorMessage);
    }

    // Replace req.params with validated data
    req.params = value;
    next();
  };
};

// Common validation schemas
export const searchRequestSchema = Joi.object({
  from_location: Joi.string().min(2).max(100).required(),
  to_location: Joi.string().min(2).max(100).required(),
  departure_date: Joi.date().iso().min('now').required(),
  return_date: Joi.date().iso().min(Joi.ref('departure_date')).optional(),
  passengers_count: Joi.number().integer().min(1).max(9).required(),
  transport_type: Joi.string().valid('airplane', 'train', 'bus').required(),
  trip_type: Joi.string().valid('one_way', 'round_trip').required()
});

export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  first_name: Joi.string().min(2).max(50).optional(),
  last_name: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const createBookingSchema = Joi.object({
  ticket_id: Joi.string().required(),
  provider_name: Joi.string().required(),
  passengers: Joi.array().items(
    Joi.object({
      first_name: Joi.string().min(2).max(50).required(),
      last_name: Joi.string().min(2).max(50).required(),
      birth_date: Joi.date().max('now').required(),
      passport_number: Joi.string().optional(),
      nationality: Joi.string().min(2).max(50).required(),
      seat_preference: Joi.string().optional()
    })
  ).min(1).required(),
  contact_info: Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().optional()
  }).required(),
  payment_method: Joi.object({
    type: Joi.string().valid('card', 'paypal', 'bank_transfer').required(),
    card_number: Joi.string().when('type', {
      is: 'card',
      then: Joi.required()
    }),
    expiry_date: Joi.string().when('type', {
      is: 'card',
      then: Joi.required()
    }),
    cvv: Joi.string().when('type', {
      is: 'card',
      then: Joi.required()
    }),
    cardholder_name: Joi.string().when('type', {
      is: 'card',
      then: Joi.required()
    })
  }).required()
});

export const paymentRequestSchema = Joi.object({
  booking_id: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).required(),
  payment_method: Joi.object({
    type: Joi.string().valid('card', 'paypal', 'bank_transfer').required(),
    card_number: Joi.string().when('type', {
      is: 'card',
      then: Joi.required()
    }),
    expiry_date: Joi.string().when('type', {
      is: 'card',
      then: Joi.required()
    }),
    cvv: Joi.string().when('type', {
      is: 'card',
      then: Joi.required()
    }),
    cardholder_name: Joi.string().when('type', {
      is: 'card',
      then: Joi.required()
    })
  }).required()
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort_by: Joi.string().valid('price', 'departure_date', 'duration', 'created_at').optional(),
  sort_order: Joi.string().valid('asc', 'desc').default('asc')
});