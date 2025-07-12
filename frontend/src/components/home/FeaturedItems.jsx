import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Heart, Share2, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const FeaturedItems = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/items/trending`);
        setItems(res.data.data || []);
      } catch (err) {
        setError("Failed to load featured items");
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(items.length / 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.ceil(items.length / 3) - 1 : prev - 1
    );
  };

  const getVisibleItems = () => {
    const startIndex = currentIndex * 3;
    return items.slice(startIndex, startIndex + 3);
  };

  const handleItemClick = (itemId) => {
    navigate(`/items/${itemId}`);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-lg text-gray-500">Loading featured items...</div>
        </div>
      </section>
    );
  }
  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </section>
    );
  }
  if (!items.length) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-lg text-gray-500">No featured items yet.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Items
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing pieces from our community. Each item has a story
            and is looking for a new home.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Items Grid */}
          <div className="px-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {getVisibleItems().map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <Card 
                      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => handleItemClick(item.id)}
                    >
                      <div className="relative">
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          {item.images && item.images[0] ? (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-gray-400 text-4xl">👕</div>
                          )}
                        </div>
                        <div className="absolute top-3 right-3 flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-white/80 hover:bg-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-white/80 hover:bg-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            {item.condition}
                          </span>
                        </div>
                      </div>

                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <p className="text-sm text-gray-500">{item.category}</p>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>by {item.uploader?.name || "User"}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Heart className="h-3 w-3" />
                              <span>{item.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{item.views}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(items.length / 3) }).map(
              (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
              )
            )}
          </div>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-12"
        >
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
          >
            View All Items
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedItems;
