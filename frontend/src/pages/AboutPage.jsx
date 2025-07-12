import React from 'react'
import { motion } from 'framer-motion'
import { Users, Target, Heart, Globe, Award, Code, Database, Palette } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'

const AboutPage = () => {
  const teamMembers = [
    {
      name: "Manav Patel",
      role: "Full Stack Developer",
      skills: ["MERN Stack", "TypeScript", ".NET"],
      avatar: "👨‍💻"
    },
    {
      name: "Jay Shah", 
      role: "frontend Developer",
      skills: ["React.js", "UI-UX"],
      avatar: "👩‍💻"
    },
    {
      name: "Dhaval Agnani",
      role: "Full Stack Developer", 
      skills: ["React", "Node.js", "DevOps"],
      avatar: "👨‍💻"
    },
    {
      name: "Vandan Soni",
      role: "Full stack Developer",
      skills: ["MERN Stack", "TypeScript", ".NET"],
      avatar: "👩‍🎨"
    }
  ]

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community-Driven",
      description: "Built by the community, for the community. Every feature is designed with user feedback in mind."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Sustainable Fashion",
      description: "Promoting eco-friendly practices by extending the lifecycle of clothing items."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Social Impact",
      description: "Reducing textile waste while building meaningful connections between people."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Reach",
      description: "Accessible platform that can be used by anyone, anywhere in the world."
    }
  ]

  const techStack = [
    { name: "Frontend", tech: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"] },
    { name: "Backend", tech: ["Node.js", "Express.js", "MongoDB", "JWT"] },
    { name: "Deployment", tech: ["Vercel", "Railway", "MongoDB Atlas"] },
    { name: "Tools", tech: ["Git", "VS Code", "Postman", "Figma"] }
  ]

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
            About <span className="text-green-600">ReWear</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A sustainable clothing exchange platform built for the Oddo Hackathon. 
            We're on a mission to reduce textile waste and build meaningful connections through fashion.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-8">
              <div className="text-center">
                <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
                  ReWear is more than just a clothing exchange platform. We're building a community 
                  that values sustainability, connection, and conscious consumption. Our goal is to 
                  reduce the environmental impact of fast fashion while creating meaningful relationships 
                  between people who share our vision for a better world.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why ReWear?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="text-green-600 mb-4 flex justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{member.avatar}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-green-600 font-medium mb-3">{member.role}</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {member.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((stack, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 + index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg text-center">{stack.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stack.tech.map((tech, techIndex) => (
                        <div
                          key={techIndex}
                          className="flex items-center space-x-2 text-sm text-gray-600"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{tech}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Hackathon Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Oddo Hackathon</h2>
              <p className="text-lg text-gray-700 mb-6">
                This project was developed as part of the Oddo Hackathon, showcasing our team's 
                ability to create innovative solutions that address real-world problems. We're proud 
                to present ReWear as our contribution to sustainable technology.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Code className="w-4 h-4 mr-2" />
                  Innovative Solution
                </span>
                <span className="flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Scalable Architecture
                </span>
                <span className="flex items-center">
                  <Palette className="w-4 h-4 mr-2" />
                  User-Centric Design
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default AboutPage 