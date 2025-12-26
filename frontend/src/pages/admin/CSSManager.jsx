import React, { useState, useEffect } from 'react';
import { Save, Eye, RotateCcw, Palette, Home, Package, ShoppingBag, FileText, Users, Phone, Layout } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Default CSS settings organized by page
const defaultPageStyles = {
  global: {
    headerBg: "#3d2518",
    headerText: "#ffffff",
    headerNavHover: "#f59e0b",
    footerBg: "#3d2518",
    footerText: "#fef3c7",
    footerLink: "#f59e0b",
    primaryColor: "#3d2518",
    accentColor: "#f59e0b",
    accentHover: "#d97706",
    textColor: "#1f2937",
    textLight: "#6b7280",
    backgroundColor: "#fffbeb",
    cardBg: "#ffffff",
    cardBorder: "#e5e7eb",
    buttonRadius: "0.5rem"
  },
  home: {
    heroBg: "#3d2518",
    heroText: "#ffffff",
    heroAccent: "#fef3c7",
    categoryCardBg: "#ffffff",
    categoryCardHover: "#fef3c7",
    productCardBg: "#ffffff",
    productPriceColor: "#f59e0b",
    sectionBg: "#fffbeb",
    testimonialBg: "#3d2518",
    testimonialText: "#ffffff"
  },
  products: {
    pageBg: "#f5f0eb",
    filterBg: "#ffffff",
    filterActive: "#f59e0b",
    productCardBg: "#ffffff",
    productNameColor: "#1f2937",
    productPriceColor: "#f59e0b",
    categoryBadgeBg: "#fef3c7",
    categoryBadgeText: "#92400e"
  },
  productDetail: {
    pageBg: "#f5f0eb",
    detailsBg: "#3d2518",
    detailsText: "#ffffff",
    priceColor: "#f59e0b",
    sizeBtnBg: "#2d1810",
    sizeBtnActive: "#f59e0b",
    whatsappBtnBg: "#16a34a",
    callBtnBg: "#f59e0b",
    featureBoxBg: "#2d1810",
    tabActiveBg: "#fffbeb",
    tabActiveText: "#b45309"
  },
  bulkOrder: {
    heroBg: "#3d2518",
    heroText: "#ffffff",
    formBg: "#ffffff",
    inputBorder: "#e5e7eb",
    inputFocus: "#f59e0b",
    submitBtnBg: "#f59e0b",
    whatsappBtnBg: "#16a34a",
    benefitIconBg: "#fef3c7",
    benefitIconColor: "#f59e0b",
    ctaBoxBg: "#3d2518"
  },
  career: {
    heroBg: "#3d2518",
    heroText: "#ffffff",
    contentBg: "#ffffff",
    emailLinkColor: "#f59e0b",
    iconBg: "#fef3c7",
    iconColor: "#f59e0b"
  },
  aboutUs: {
    heroBg: "#3d2518",
    heroText: "#ffffff",
    storyBg: "#ffffff",
    statsBg: "#fef3c7",
    statsNumber: "#f59e0b",
    visionCardBg: "#ffffff",
    visionIconBg: "#fef3c7",
    valuesIconBg: "#fef3c7",
    whyChooseBg: "#3d2518",
    whyChooseCardBg: "#4d2f20"
  },
  contact: {
    heroBg: "#3d2518",
    heroText: "#ffffff",
    formBg: "#ffffff",
    inputBorder: "#e5e7eb",
    submitBtnBg: "#f59e0b",
    infoBg: "#fef3c7",
    infoIconColor: "#f59e0b"
  }
};

// Color picker component
const ColorPicker = ({ label, value, onChange, description }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded cursor-pointer border-2 border-gray-200 p-0.5"
      />
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none"
        placeholder="#000000"
      />
    </div>
    {description && <p className="text-xs text-gray-500">{description}</p>}
  </div>
);

// Page tab configuration
const pageTabs = [
  { id: 'global', label: 'Global', icon: Layout, description: 'Header, Footer & Common Styles' },
  { id: 'home', label: 'Home', icon: Home, description: 'Homepage Sections' },
  { id: 'products', label: 'Products', icon: Package, description: 'Product Listing Page' },
  { id: 'productDetail', label: 'Product Detail', icon: ShoppingBag, description: 'Single Product Page' },
  { id: 'bulkOrder', label: 'Bulk Order', icon: FileText, description: 'Bulk Order Page' },
  { id: 'career', label: 'Career', icon: Users, description: 'Career Page' },
  { id: 'aboutUs', label: 'About Us', icon: Users, description: 'About Us Page' },
  { id: 'contact', label: 'Contact', icon: Phone, description: 'Contact Section' }
];

// Field labels for each page
const fieldLabels = {
  global: {
    headerBg: { label: 'Header Background', desc: 'Main navigation bar background' },
    headerText: { label: 'Header Text', desc: 'Navigation text color' },
    headerNavHover: { label: 'Nav Hover Color', desc: 'Navigation link hover' },
    footerBg: { label: 'Footer Background', desc: 'Footer section background' },
    footerText: { label: 'Footer Text', desc: 'Footer text color' },
    footerLink: { label: 'Footer Links', desc: 'Footer link color' },
    primaryColor: { label: 'Primary Color', desc: 'Main brand color' },
    accentColor: { label: 'Accent Color', desc: 'Buttons & highlights' },
    accentHover: { label: 'Accent Hover', desc: 'Hover state for accent' },
    textColor: { label: 'Text Color', desc: 'Main body text' },
    textLight: { label: 'Light Text', desc: 'Secondary text' },
    backgroundColor: { label: 'Background', desc: 'Page background' },
    cardBg: { label: 'Card Background', desc: 'Card components' },
    cardBorder: { label: 'Card Border', desc: 'Card border color' },
    buttonRadius: { label: 'Button Radius', desc: 'e.g., 0.5rem, 8px' }
  },
  home: {
    heroBg: { label: 'Hero Background', desc: 'Hero section background' },
    heroText: { label: 'Hero Text', desc: 'Hero text color' },
    heroAccent: { label: 'Hero Accent', desc: 'Hero subtitle/accent' },
    categoryCardBg: { label: 'Category Card BG', desc: 'Category card background' },
    categoryCardHover: { label: 'Category Hover', desc: 'Category card hover' },
    productCardBg: { label: 'Product Card BG', desc: 'Product card background' },
    productPriceColor: { label: 'Price Color', desc: 'Product price color' },
    sectionBg: { label: 'Section Background', desc: 'Alternate section bg' },
    testimonialBg: { label: 'Testimonial BG', desc: 'Testimonial section' },
    testimonialText: { label: 'Testimonial Text', desc: 'Testimonial text' }
  },
  products: {
    pageBg: { label: 'Page Background', desc: 'Products page background' },
    filterBg: { label: 'Filter Background', desc: 'Filter sidebar bg' },
    filterActive: { label: 'Filter Active', desc: 'Active filter color' },
    productCardBg: { label: 'Product Card BG', desc: 'Product card background' },
    productNameColor: { label: 'Product Name', desc: 'Product name color' },
    productPriceColor: { label: 'Price Color', desc: 'Product price' },
    categoryBadgeBg: { label: 'Badge Background', desc: 'Category badge bg' },
    categoryBadgeText: { label: 'Badge Text', desc: 'Category badge text' }
  },
  productDetail: {
    pageBg: { label: 'Page Background', desc: 'Detail page background' },
    detailsBg: { label: 'Details Panel BG', desc: 'Right panel background' },
    detailsText: { label: 'Details Text', desc: 'Details text color' },
    priceColor: { label: 'Price Color', desc: 'Product price' },
    sizeBtnBg: { label: 'Size Button BG', desc: 'Size button default' },
    sizeBtnActive: { label: 'Size Active', desc: 'Selected size button' },
    whatsappBtnBg: { label: 'WhatsApp Button', desc: 'WhatsApp button color' },
    callBtnBg: { label: 'Call Button', desc: 'Call button color' },
    featureBoxBg: { label: 'Feature Box BG', desc: 'Health features box' },
    tabActiveBg: { label: 'Tab Active BG', desc: 'Active tab background' },
    tabActiveText: { label: 'Tab Active Text', desc: 'Active tab text' }
  },
  bulkOrder: {
    heroBg: { label: 'Hero Background', desc: 'Hero section' },
    heroText: { label: 'Hero Text', desc: 'Hero text color' },
    formBg: { label: 'Form Background', desc: 'Inquiry form bg' },
    inputBorder: { label: 'Input Border', desc: 'Form input border' },
    inputFocus: { label: 'Input Focus', desc: 'Focus ring color' },
    submitBtnBg: { label: 'Submit Button', desc: 'Submit button color' },
    whatsappBtnBg: { label: 'WhatsApp Button', desc: 'WhatsApp button' },
    benefitIconBg: { label: 'Benefit Icon BG', desc: 'Benefit icon background' },
    benefitIconColor: { label: 'Benefit Icon', desc: 'Benefit icon color' },
    ctaBoxBg: { label: 'CTA Box BG', desc: 'Call-to-action box' }
  },
  career: {
    heroBg: { label: 'Hero Background', desc: 'Hero section' },
    heroText: { label: 'Hero Text', desc: 'Hero text color' },
    contentBg: { label: 'Content Background', desc: 'Main content bg' },
    emailLinkColor: { label: 'Email Link', desc: 'Email link color' },
    iconBg: { label: 'Icon Background', desc: 'Icon circle bg' },
    iconColor: { label: 'Icon Color', desc: 'Icon color' }
  },
  aboutUs: {
    heroBg: { label: 'Hero Background', desc: 'Hero section' },
    heroText: { label: 'Hero Text', desc: 'Hero text color' },
    storyBg: { label: 'Story Background', desc: 'Our story section' },
    statsBg: { label: 'Stats Background', desc: 'Statistics box bg' },
    statsNumber: { label: 'Stats Number', desc: 'Statistics number color' },
    visionCardBg: { label: 'Vision Card BG', desc: 'Vision/Mission cards' },
    visionIconBg: { label: 'Vision Icon BG', desc: 'Vision icon background' },
    valuesIconBg: { label: 'Values Icon BG', desc: 'Values icon background' },
    whyChooseBg: { label: 'Why Choose BG', desc: 'Why choose us section' },
    whyChooseCardBg: { label: 'Why Choose Card', desc: 'Feature card bg' }
  },
  contact: {
    heroBg: { label: 'Hero Background', desc: 'Hero section' },
    heroText: { label: 'Hero Text', desc: 'Hero text color' },
    formBg: { label: 'Form Background', desc: 'Contact form bg' },
    inputBorder: { label: 'Input Border', desc: 'Form input border' },
    submitBtnBg: { label: 'Submit Button', desc: 'Submit button color' },
    infoBg: { label: 'Info Box BG', desc: 'Contact info box' },
    infoIconColor: { label: 'Info Icon', desc: 'Info icon color' }
  }
};

const CSSManager = () => {
  const [pageStyles, setPageStyles] = useState(defaultPageStyles);
  const [activeTab, setActiveTab] = useState('global');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState('/');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/site-settings`);
      if (response.data.pageStyles) {
        setPageStyles(prev => deepMerge(prev, response.data.pageStyles));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const deepMerge = (target, source) => {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  };

  const updatePageStyle = (page, key, value) => {
    setPageStyles(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(`${API}/site-settings`, { pageStyles });
      
      // Apply styles to document
      applyStylesToDocument(pageStyles);
      
      alert('CSS settings saved successfully! Changes are now live.');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving CSS settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all CSS settings to defaults? This cannot be undone.')) {
      setPageStyles(defaultPageStyles);
    }
  };

  const handleResetPage = () => {
    if (window.confirm(`Reset ${activeTab} page styles to defaults?`)) {
      setPageStyles(prev => ({
        ...prev,
        [activeTab]: defaultPageStyles[activeTab]
      }));
    }
  };

  const applyStylesToDocument = (styles) => {
    const root = document.documentElement;
    const global = styles.global;
    
    // Apply global CSS variables
    if (global) {
      root.style.setProperty('--header-bg', global.headerBg);
      root.style.setProperty('--header-text', global.headerText);
      root.style.setProperty('--header-nav-hover', global.headerNavHover);
      root.style.setProperty('--footer-bg', global.footerBg);
      root.style.setProperty('--footer-text', global.footerText);
      root.style.setProperty('--footer-link', global.footerLink);
      root.style.setProperty('--color-primary', global.primaryColor);
      root.style.setProperty('--color-accent', global.accentColor);
      root.style.setProperty('--color-accentHover', global.accentHover);
      root.style.setProperty('--color-text', global.textColor);
      root.style.setProperty('--color-textLight', global.textLight);
      root.style.setProperty('--color-background', global.backgroundColor);
      root.style.setProperty('--card-bg', global.cardBg);
      root.style.setProperty('--card-border', global.cardBorder);
      root.style.setProperty('--btn-radius', global.buttonRadius);
    }
  };

  const openPreview = (pagePath) => {
    setPreviewPage(pagePath);
    setPreviewOpen(true);
    // Apply current styles for preview
    applyStylesToDocument(pageStyles);
  };

  const getPreviewPath = (tabId) => {
    const paths = {
      global: '/',
      home: '/',
      products: '/products',
      productDetail: '/product/premium-california-almonds',
      bulkOrder: '/bulk-order',
      career: '/career',
      aboutUs: '/about',
      contact: '/'
    };
    return paths[tabId] || '/';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-500">Loading CSS settings...</div>
      </div>
    );
  }

  const currentTab = pageTabs.find(t => t.id === activeTab);
  const currentFields = fieldLabels[activeTab] || {};
  const currentStyles = pageStyles[activeTab] || {};

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Palette className="w-6 h-6 text-amber-500" />
            CSS Customizer
          </h1>
          <p className="text-gray-600">Customize colors for each page with live preview</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleResetPage}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Page
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All
          </button>
          <button
            onClick={() => openPreview(getPreviewPath(activeTab))}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            Preview Page
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Page Tabs Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-700">Pages</h3>
            </div>
            <div className="p-2">
              {pageTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeTab === tab.id
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-amber-500' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-medium text-sm">{tab.label}</div>
                    <div className="text-xs text-gray-500">{tab.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Color Settings */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentTab && <currentTab.icon className="w-5 h-5 text-amber-500" />}
                <div>
                  <h3 className="font-semibold text-gray-700">{currentTab?.label} Page Colors</h3>
                  <p className="text-xs text-gray-500">{currentTab?.description}</p>
                </div>
              </div>
              <button
                onClick={() => openPreview(getPreviewPath(activeTab))}
                className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
            
            <div className="p-6 max-h-[600px] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(currentFields).map(([key, field]) => (
                  <ColorPicker
                    key={key}
                    label={field.label}
                    description={field.desc}
                    value={currentStyles[key]}
                    onChange={(value) => updatePageStyle(activeTab, key, value)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Preview Panel */}
          <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">Quick Preview</span>
            </div>
            <div className="p-6">
              {activeTab === 'global' && (
                <div className="space-y-4">
                  {/* Header Preview */}
                  <div 
                    className="rounded-lg p-4 flex items-center justify-between"
                    style={{ backgroundColor: currentStyles.headerBg }}
                  >
                    <span className="font-bold" style={{ color: currentStyles.headerText }}>Logo</span>
                    <div className="flex gap-4">
                      {['Home', 'Shop', 'About'].map(item => (
                        <span 
                          key={item} 
                          className="cursor-pointer hover:opacity-80"
                          style={{ color: currentStyles.headerText }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Button Preview */}
                  <div className="flex gap-3">
                    <button
                      className="px-4 py-2 font-medium text-white transition-colors"
                      style={{ 
                        backgroundColor: currentStyles.accentColor,
                        borderRadius: currentStyles.buttonRadius 
                      }}
                    >
                      Primary Button
                    </button>
                    <button
                      className="px-4 py-2 font-medium text-white transition-colors"
                      style={{ 
                        backgroundColor: currentStyles.primaryColor,
                        borderRadius: currentStyles.buttonRadius 
                      }}
                    >
                      Secondary Button
                    </button>
                  </div>

                  {/* Footer Preview */}
                  <div 
                    className="rounded-lg p-4"
                    style={{ backgroundColor: currentStyles.footerBg }}
                  >
                    <div className="flex justify-between items-center">
                      <span style={{ color: currentStyles.footerText }}>© 2024 Your Brand</span>
                      <span style={{ color: currentStyles.footerLink }} className="cursor-pointer">Privacy Policy</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'home' && (
                <div className="space-y-4">
                  <div 
                    className="rounded-lg p-6 text-center"
                    style={{ backgroundColor: currentStyles.heroBg }}
                  >
                    <h2 className="text-xl font-bold" style={{ color: currentStyles.heroText }}>Hero Section</h2>
                    <p style={{ color: currentStyles.heroAccent }}>Welcome subtitle text</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className="p-4 rounded-lg border"
                      style={{ backgroundColor: currentStyles.productCardBg }}
                    >
                      <div className="w-full h-16 bg-gray-200 rounded mb-2"></div>
                      <p className="font-medium" style={{ color: '#1f2937' }}>Product Name</p>
                      <p className="font-bold" style={{ color: currentStyles.productPriceColor }}>₹999</p>
                    </div>
                    <div 
                      className="p-4 rounded-lg border"
                      style={{ backgroundColor: currentStyles.categoryCardBg }}
                    >
                      <p className="font-medium text-center">Category Card</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'productDetail' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 rounded-lg p-4 h-32 flex items-center justify-center">
                    <span className="text-gray-500">Product Image</span>
                  </div>
                  <div 
                    className="rounded-lg p-4"
                    style={{ backgroundColor: currentStyles.detailsBg }}
                  >
                    <h3 className="font-bold mb-2" style={{ color: currentStyles.detailsText }}>Product Name</h3>
                    <p className="text-2xl font-bold mb-3" style={{ color: currentStyles.priceColor }}>₹999</p>
                    <div className="flex gap-2 mb-3">
                      <span 
                        className="px-3 py-1 rounded-full text-xs text-white"
                        style={{ backgroundColor: currentStyles.sizeBtnActive }}
                      >100g</span>
                      <span 
                        className="px-3 py-1 rounded-full text-xs text-white"
                        style={{ backgroundColor: currentStyles.sizeBtnBg }}
                      >250g</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 py-2 rounded text-white text-xs"
                        style={{ backgroundColor: currentStyles.whatsappBtnBg }}
                      >WhatsApp</button>
                      <button 
                        className="flex-1 py-2 rounded text-white text-xs"
                        style={{ backgroundColor: currentStyles.callBtnBg }}
                      >Call</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bulkOrder' && (
                <div className="space-y-4">
                  <div 
                    className="rounded-lg p-4 text-center"
                    style={{ backgroundColor: currentStyles.heroBg }}
                  >
                    <h3 className="font-bold" style={{ color: currentStyles.heroText }}>Bulk Orders</h3>
                  </div>
                  <div 
                    className="rounded-lg p-4"
                    style={{ backgroundColor: currentStyles.formBg }}
                  >
                    <input 
                      className="w-full px-3 py-2 rounded mb-3"
                      style={{ border: `1px solid ${currentStyles.inputBorder}` }}
                      placeholder="Your Name"
                    />
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 py-2 rounded text-white text-sm"
                        style={{ backgroundColor: currentStyles.submitBtnBg }}
                      >Submit</button>
                      <button 
                        className="flex-1 py-2 rounded text-white text-sm"
                        style={{ backgroundColor: currentStyles.whatsappBtnBg }}
                      >WhatsApp</button>
                    </div>
                  </div>
                </div>
              )}

              {(activeTab === 'career' || activeTab === 'aboutUs' || activeTab === 'contact' || activeTab === 'products') && (
                <div className="space-y-4">
                  <div 
                    className="rounded-lg p-4 text-center"
                    style={{ backgroundColor: currentStyles.heroBg }}
                  >
                    <h3 className="font-bold" style={{ color: currentStyles.heroText }}>{currentTab?.label} Page Hero</h3>
                  </div>
                  <div 
                    className="rounded-lg p-4"
                    style={{ backgroundColor: currentStyles.contentBg || currentStyles.formBg || currentStyles.pageBg || '#ffffff' }}
                  >
                    <p className="text-gray-600 text-sm">Page content preview area</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Page Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Preview: {currentTab?.label} Page</h3>
              <div className="flex items-center gap-4">
                <select
                  value={previewPage}
                  onChange={(e) => setPreviewPage(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm"
                >
                  <option value="/">Home</option>
                  <option value="/products">Products</option>
                  <option value="/product/premium-california-almonds">Product Detail</option>
                  <option value="/bulk-order">Bulk Order</option>
                  <option value="/career">Career</option>
                  <option value="/about">About Us</option>
                </select>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                >
                  Close Preview
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={previewPage}
                className="w-full h-full border-0"
                title="Page Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSSManager;
