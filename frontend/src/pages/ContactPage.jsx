import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, MessageSquare, Send, Github, Linkedin, Twitter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import FormInput from '../components/ui/FormInput'


const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)


  const teamContacts = [
    {
      name: "Manav Patel",
      role: "Full Stack Developer",
      email: "member1@rewear.com",
      phone: "+1 (555) 123-4567",
      github: "github.com/member1",
      linkedin: "linkedin.com/in/member1",
      avatar: "👨‍💻"
    },
    {
      name: "Vandan Soni",
      role: "Full Stack Developer", 
      email: "member2@rewear.com",
      phone: "+1 (555) 234-5678",
      github: "github.com/member2",
      linkedin: "linkedin.com/in/member2",
      avatar: "👩‍💻"
    },
    {
      name: "Dhaval Agnani",
      role: "Full Stack Developer",
      email: "member3@rewear.com", 
      phone: "+1 (555) 345-6789",
      github: "github.com/member3",
      linkedin: "linkedin.com/in/member3",
      avatar: "👨‍💻"
    },
    {
      name: "Jay Shah",
      role: "Frontend Developer",
      email: "member4@rewear.com",
      phone: "+1 (555) 456-7890",
      github: "github.com/member4",
      linkedin: "linkedin.com/in/member4",
      avatar: "👩‍🎨"
    }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Form submitted successfully
    setIsSubmitting(false)
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get in <span className="text-green-600">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about ReWear? Want to collaborate? We'd love to hear from you! 
            Our team is here to help and answer any questions you might have.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                    <FormInput
                      label="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <FormInput
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Tell us about your inquiry..."
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            {/* General Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">hello@rewear.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">+1 (555) 000-0000</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">Virtual Team - Global</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Meet Our Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamContacts.map((member, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                      className="border-b border-gray-200 pb-4 last:border-b-0"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{member.avatar}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          <p className="text-green-600 text-sm mb-2">{member.role}</p>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>{member.email}</p>
                            <p>{member.phone}</p>
                            <div className="flex space-x-2 mt-2">
                              <a
                                href={`https://${member.github}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <Github className="w-4 h-4" />
                              </a>
                              <a
                                href={`https://${member.linkedin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <Linkedin className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hackathon Info */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Oddo Hackathon Project</h3>
                <p className="text-gray-700 mb-4">
                  ReWear was developed as part of the Oddo Hackathon. We're excited to showcase 
                  our innovative solution for sustainable fashion and community building.
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Hackathon Team
                  </span>
                  <span className="flex items-center">
                    <Twitter className="w-4 h-4 mr-2" />
                    @ReWearHack
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>


    </div>
  )
}

export default ContactPage 