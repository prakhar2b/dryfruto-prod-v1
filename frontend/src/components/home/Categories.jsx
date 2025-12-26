import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/mock';

const Categories = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of premium dry fruits, nuts, and healthy snacks
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className="group"
            >
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-amber-100 group-hover:border-amber-300 transition-colors">
                  <img
                    src={category.icon}
                    alt={category.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-amber-700 transition-colors">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
