import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SearchForm from '../components/SearchForm'
import { apiHelpers } from '../services/api'
import { Plane, Train, Bus, Star, Clock, Users, TrendingUp } from 'lucide-react'

interface PopularRoute {
  from: string
  to: string
  transport_types: string[]
  avg_price: number
  currency: string
}

const HomePage: React.FC = () => {
  const [popularRoutes, setPopularRoutes] = useState<PopularRoute[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPopularRoutes = async () => {
      try {
        const response = await apiHelpers.getPopularRoutes()
        if (response.success) {
          setPopularRoutes(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch popular routes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPopularRoutes()
  }, [])

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'airplane':
        return <Plane className="w-4 h-4" />
      case 'train':
        return <Train className="w-4 h-4" />
      case 'bus':
        return <Bus className="w-4 h-4" />
      default:
        return <Plane className="w-4 h-4" />
    }
  }

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Best Prices',
      description: 'Compare prices from multiple providers to find the best deals'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Quick Search',
      description: 'Find tickets in seconds with our powerful search engine'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Multiple Transport',
      description: 'Search across flights, trains, and buses all in one place'
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Trusted Providers',
      description: 'Book with confidence through our verified partners'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Perfect Journey
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
            Compare prices from multiple providers for flights, trains, and buses. 
            Book your tickets with the best deals guaranteed.
          </p>
          
          {/* Search Form */}
          <div className="max-w-6xl mx-auto">
            <SearchForm isCompact={true} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose TicketAggregator?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make travel planning simple, affordable, and convenient
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                  <div className="text-primary-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Routes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the most searched destinations and find great deals
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularRoutes.map((route, index) => (
                <div key={index} className="card-hover group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {route.from} → {route.to}
                      </h3>
                      <div className="flex items-center space-x-2 mt-2">
                        {route.transport_types.map((type, typeIndex) => (
                          <div key={typeIndex} className="flex items-center space-x-1 text-sm text-gray-600">
                            {getTransportIcon(type)}
                            <span className="capitalize">{type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        {route.avg_price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {route.currency}
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    to={`/search?from=${route.from}&to=${route.to}`}
                    className="btn-outline w-full text-center group-hover:bg-primary-50 group-hover:border-primary-300 transition-colors"
                  >
                    Search Tickets
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Join thousands of travelers who trust us to find the best deals on their tickets
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/search"
              className="btn-secondary text-primary-600 hover:bg-white"
            >
              Search Now
            </Link>
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage