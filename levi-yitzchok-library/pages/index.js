import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, update, remove } from 'firebase/database';
import { Book, User, Calendar, DollarSign, Search, Plus, Edit, Trash2, LogIn, LogOut, Users, BookOpen, Clock, AlertCircle } from 'lucide-react';

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqsnCNPR3O4W9nUfzJorGX3kdHnRWPI9Y",
  authDomain: "levi-yitzchok-library.firebaseapp.com",
  databaseURL: "https://levi-yitzchok-library-default-rtdb.firebaseio.com",
  projectId: "levi-yitzchok-library",
  storageBucket: "levi-yitzchok-library.firebasestorage.app",
  messagingSenderId: "1000072970171",
  appId: "1:1000072970171:web:b9858668b45ee40581ce9e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const LibrarySystem = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddBook, setShowAddBook] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Initialize data on first load
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check if data exists, if not, initialize with default data
        const booksRef = ref(database, 'books');
        onValue(booksRef, (snapshot) => {
          if (!snapshot.exists()) {
            // Initialize with default data
            const defaultBooks = {
              1: { id: 1, title: 'The Adventures of Mottel', author: 'Sholom Aleichem', category: 'Chapter Books', isbn: '9780486264697', available: true },
              2: { id: 2, title: 'Tanya for Children', author: 'Rabbi Schneur Zalman', category: 'Rebbe Books', isbn: '9781881400158', available: true },
              3: { id: 3, title: 'The Little Midrash Says', author: 'Rabbi Weissman', category: 'Torah', isbn: '9781578190270', available: false },
              4: { id: 4, title: 'Spiderman Adventures', author: 'Stan Lee', category: 'Comics', isbn: '9780785108375', available: true },
              5: { id: 5, title: 'The Chosen One', author: 'Chaim Potok', category: 'Novels', isbn: '9780449213445', available: true },
              6: { id: 6, title: 'My First Aleph-Bet', author: 'Torah Tots', category: 'Kiddy Books', isbn: '9781422603123', available: true },
              7: { id: 7, title: 'Stories of the Baal Shem Tov', author: 'Rabbi Zevin', category: 'Chassidus', isbn: '9789655240474', available: true },
              8: { id: 8, title: 'Curious George Goes to Shul', author: 'H.A. Rey', category: 'Picture Books', isbn: '9780618711932', available: true }
            };
            set(ref(database, 'books'), defaultBooks);
            setBooks(Object.values(defaultBooks));
          } else {
            setBooks(Object.values(snapshot.val()));
          }
        });

        const usersRef = ref(database, 'users');
        onValue(usersRef, (snapshot) => {
          if (!snapshot.exists()) {
            const defaultUsers = {
              1: { id: 1, username: 'admin', password: 'admin123', type: 'admin', email: 'admin@library.com', accountPaid: true, balance: 0 },
              2: { id: 2, username: 'john_doe', password: 'user123', type: 'user', email: 'john@email.com', accountPaid: true, balance: 0 },
              3: { id: 3, username: 'jane_smith', password: 'user123', type: 'user', email: 'jane@email.com', accountPaid: true, balance: 1.20 }
            };
            set(ref(database, 'users'), defaultUsers);
            setUsers(Object.values(defaultUsers));
          } else {
            setUsers(Object.values(snapshot.val()));
          }
        });

        const categoriesRef = ref(database, 'categories');
        onValue(categoriesRef, (snapshot) => {
          if (!snapshot.exists()) {
            const defaultCategories = ['Torah', 'Rebbe Books', 'Chapter Books', 'Novels', 'Comics', 'Kiddy Books', 'Jewish History', 'Halacha', 'Chassidus', 'Picture Books', 'Middle Grade', 'Young Adult'];
            set(ref(database, 'categories'), defaultCategories);
            setCategories(defaultCategories);
          } else {
            setCategories(Object.values(snapshot.val()));
          }
        });

        // Initialize other collections
        const borrowedBooksRef = ref(database, 'borrowedBooks');
        onValue(borrowedBooksRef, (snapshot) => {
          if (snapshot.exists()) {
            setBorrowedBooks(Object.values(snapshot.val()));
          }
        });

        const borrowRequestsRef = ref(database, 'borrowRequests');
        onValue(borrowRequestsRef, (snapshot) => {
          if (snapshot.exists()) {
            setBorrowRequests(Object.values(snapshot.val()));
          }
        });

        const returnRequestsRef = ref(database, 'returnRequests');
        onValue(returnRequestsRef, (snapshot) => {
          if (snapshot.exists()) {
            setReturnRequests(Object.values(snapshot.val()));
          }
        });

        setLoading(false);
      } catch (error) {
        console.error('Error initializing data:', error);
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Add all your existing functions here (handleLogin, addBook, etc.)
  // Just replace the mock Firebase calls with real ones using the imports above
  
  const handleLogin = () => {
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setUserType(user.type);
      setLoginForm({ username: '', password: '' });
    } else {
      alert('Invalid credentials');
    }
  };

  const addBook = async (bookData) => {
    const newBook = {
      id: Math.max(...books.map(b => b.id), 0) + 1,
      ...bookData,
      available: true
    };
    
    const updatedBooks = [...books, newBook];
    setBooks(updatedBooks);
    
    // Save to Firebase
    const booksObj = {};
    updatedBooks.forEach(book => {
      booksObj[book.id] = book;
    });
    await set(ref(database, 'books'), booksObj);
    
    setShowAddBook(false);
  };

  // Add rest of your functions...

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-blue-600 mb-4 animate-spin" />
          <p className="text-gray-600">Loading library system...</p>
        </div>
      </div>
    );
  }

  // Add your existing JSX here...
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-16 w-16 text-blue-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">Levi Yitzchok Library</h1>
        <p className="text-gray-600">Inner Circle II</p>
        <p className="mt-4 text-lg">🔥 Firebase Integration Ready!</p>
        <p className="text-sm text-gray-500 mt-2">Replace the config above with your Firebase settings</p>
      </div>
    </div>
  );
};

export default LibrarySystem;
