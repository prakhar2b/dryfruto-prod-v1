import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create context
const DataContext = createContext();

// Provider component
export const DataProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [giftBoxes, setGiftBoxes] = useState([]);
  const [siteSettings, setSiteSettings] = useState({
    businessName: 'DryFruto',
    slogan: 'Live With Health',
    logo: '',
    phone: '9870990795',
    email: 'info@dryfruto.com',
    careerEmail: 'careers@dryfruto.com',
    address: '123, Main Street, New Delhi, India',
    whatsappLink: 'https://wa.me/919870990795',
    facebookLink: '',
    instagramLink: '',
    twitterLink: '',
    youtubeLink: '',
    bulkOrderProductTypes: ['Dry Fruits', 'Nuts', 'Seeds', 'Berries', 'Gift Boxes', 'Mixed Products'],
    bulkOrderBenefits: [
      'Direct sourcing from farms ensures freshness',
      'Minimum order quantity: 10 kg',
      'Special rates for orders above 100 kg',
      'Custom packaging with your branding',
      'Regular supply contracts available',
      'Quality testing certificates provided'
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [catRes, prodRes, heroRes, testRes, giftRes, settingsRes] = await Promise.all([
        axios.get(`${API}/categories`).catch(() => ({ data: [] })),
        axios.get(`${API}/products`).catch(() => ({ data: [] })),
        axios.get(`${API}/hero-slides`).catch(() => ({ data: [] })),
        axios.get(`${API}/testimonials`).catch(() => ({ data: [] })),
        axios.get(`${API}/gift-boxes`).catch(() => ({ data: [] })),
        axios.get(`${API}/site-settings`).catch(() => ({ data: {} }))
      ]);

      setCategories(catRes.data);
      setProducts(prodRes.data);
      setHeroSlides(heroRes.data);
      setTestimonials(testRes.data);
      setGiftBoxes(giftRes.data);
      if (settingsRes.data && Object.keys(settingsRes.data).length > 0) {
        setSiteSettings(settingsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    categories,
    products,
    heroSlides,
    testimonials,
    giftBoxes,
    siteSettings,
    loading,
    refreshData: fetchAllData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;
