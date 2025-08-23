import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, Plane, Train, Bus, MapPin, X } from 'lucide-react'

interface SearchFormProps {
  onClose?: () => void
  isCompact?: boolean
}

const SearchForm: React.FC<SearchFormProps> = ({ onClose, isCompact = false }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    from_location: '',
    to_location: '',
    departure_date: '',
    return_date: '',
    passengers_count: 1,
    transport_type: 'airplane' as 'airplane' | 'train' | 'bus',
    trip_type: 'one_way' as 'one_way' | 'round_trip'
  })

  const [showReturnDate, setShowReturnDate] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Navigate to search results with query parameters
    const searchParams = new URLSearchParams({
      from: formData.from_location,
      to: formData.to_location,
      date: formData.departure_date,
      passengers: formData.passengers_count.toString(),
      transport: formData.transport_type,
      trip: formData.trip_type
    })
    
    if (formData.return_date && formData.trip_type === 'round_trip') {
      searchParams.append('return_date', formData.return_date)
    }
    
    navigate(`/search?${searchParams.toString()}`)
    
    if (onClose) {
      onClose()
    }
  }

  const toggleTripType = () => {
    setFormData(prev => ({
      ...prev,
      trip_type: prev.trip_type === 'one_way' ? 'round_trip' : 'one_way'
    }))
    setShowReturnDate(!showReturnDate)
  }

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'airplane':
        return <Plane className="w-5 h-5" />
      case 'train':
        return <Train className="w-5 h-5" />
      case 'bus':
        return <Bus className="w-5 h-5" />
      default:
        return <Plane className="w-5 h-5" />
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${isCompact ? 'max-w-4xl' : 'w-full'}`}>
      <div className={`grid ${isCompact ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-12'} gap-4 items-end`}>
        {/* From Location */}
        <div className={`${isCompact ? 'lg:col-span-2' : 'md:col-span-1 lg:col-span-2'}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="from_location"
              value={formData.from_location}
              onChange={handleInputChange}
              placeholder="City, Airport, Station"
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        {/* To Location */}
        <div className={`${isCompact ? 'lg:col-span-2' : 'md:col-span-1 lg:col-span-2'}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="to_location"
              value={formData.to_location}
              onChange={handleInputChange}
              placeholder="City, Airport, Station"
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        {/* Departure Date */}
        <div className={`${isCompact ? 'lg:col-span-2' : 'md:col-span-1 lg:col-span-2'}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departure
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              name="departure_date"
              value={formData.departure_date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        {/* Return Date */}
        {showReturnDate && (
          <div className={`${isCompact ? 'lg:col-span-2' : 'md:col-span-1 lg:col-span-2'}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Return
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                name="return_date"
                value={formData.return_date}
                onChange={handleInputChange}
                min={formData.departure_date}
                className="input-field pl-10"
                required={showReturnDate}
              />
            </div>
          </div>
        )}

        {/* Passengers */}
        <div className={`${isCompact ? 'lg:col-span-2' : 'md:col-span-1 lg:col-span-2'}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Passengers
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              name="passengers_count"
              value={formData.passengers_count}
              onChange={handleInputChange}
              className="input-field pl-10"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Passenger' : 'Passengers'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transport Type */}
        <div className={`${isCompact ? 'lg:col-span-2' : 'md:col-span-1 lg:col-span-2'}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transport
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'airplane', icon: Plane, label: 'Flight' },
              { value: 'train', icon: Train, label: 'Train' },
              { value: 'bus', icon: Bus, label: 'Bus' }
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, transport_type: value as any }))}
                className={`flex flex-col items-center p-2 rounded-lg border transition-colors ${
                  formData.transport_type === value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Trip Type Toggle */}
        <div className={`${isCompact ? 'lg:col-span-2' : 'md:col-span-1 lg:col-span-2'}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trip Type
          </label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, trip_type: 'one_way' }))
                setShowReturnDate(false)
              }}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                formData.trip_type === 'one_way'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              One Way
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, trip_type: 'round_trip' }))
                setShowReturnDate(true)
              }}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                formData.trip_type === 'round_trip'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Round Trip
            </button>
          </div>
        </div>

        {/* Search Button */}
        <div className={`${isCompact ? 'lg:col-span-2' : 'md:col-span-1 lg:col-span-2'}`}>
          <button
            type="submit"
            className="w-full btn-primary py-3 text-lg font-semibold"
          >
            Search Tickets
          </button>
        </div>
      </div>

      {/* Close button for overlay */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      )}
    </form>
  )
}

export default SearchForm