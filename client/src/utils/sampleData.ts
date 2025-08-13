import { ref, set } from 'firebase/database';
import { database } from '../lib/firebase';

export const initializeSampleData = async () => {
  try {
    // Sample announcements
    const announcements = {
      'ann1': {
        title: 'Class Suspension',
        content: 'No classes on August 15 due to weather conditions. Stay safe!',
        date: '2025-08-12',
        postedBy: 'Admin',
        isActive: true
      },
      'ann2': {
        title: 'Enrollment Deadline',
        content: 'Last day for enrollment registration is August 30, 2025.',
        date: '2025-08-10',
        postedBy: 'Registrar',
        isActive: true
      }
    };

    // Sample news
    const news = {
      'news1': {
        title: 'Science Fair Winners Announced',
        summary: 'Congratulations to our outstanding students who excelled in this year\'s science fair competition.',
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        date: '2025-08-10',
        content: 'Our annual science fair showcased incredible innovations from students across all grade levels...'
      },
      'news2': {
        title: 'New Library Wing Opening',
        summary: 'The new state-of-the-art library wing will open next month with expanded digital resources.',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        date: '2025-08-08',
        content: 'The new library wing features modern study spaces, digital resources, and collaborative areas...'
      },
      'news3': {
        title: 'Athletic Championship Results',
        summary: 'Our school teams brought home multiple championships from the regional athletic competition.',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        date: '2025-08-05',
        content: 'Outstanding performance by our athletic teams in basketball, volleyball, and track and field...'
      }
    };

    // Sample events
    const events = {
      'event1': {
        title: 'Foundation Day Celebration',
        date: '2025-09-05',
        time: '9:00 AM - 5:00 PM',
        location: 'School Gymnasium',
        description: 'Join us for our annual foundation day celebration with performances, exhibitions, and activities for the whole family.'
      },
      'event2': {
        title: 'Parent-Teacher Conference',
        date: '2025-08-25',
        time: '1:00 PM - 6:00 PM',
        location: 'Individual Classrooms',
        description: 'Quarterly parent-teacher meetings to discuss student progress and academic performance.'
      },
      'event3': {
        title: 'Career Fair',
        date: '2025-09-15',
        time: '10:00 AM - 3:00 PM',
        location: 'Main Auditorium',
        description: 'Meet with industry professionals and explore career opportunities across various fields.'
      }
    };

    // Sample hero images
    const heroImages = [
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080',
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080'
    ];

    // Write data to Firebase
    await Promise.all([
      set(ref(database, 'announcements'), announcements),
      set(ref(database, 'news'), news),
      set(ref(database, 'events'), events),
      set(ref(database, 'landingPage/heroImages'), heroImages)
    ]);

    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

// Function to be called from admin panel
export const resetSampleData = () => {
  return initializeSampleData();
};