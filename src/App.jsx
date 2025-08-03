import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, setDoc, deleteDoc, query } from 'firebase/firestore';

const App = () => {
  // Configuración de Firebase, provista por el entorno
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

  const [inspections, setInspections] = useState([]);
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [registrationYear, setRegistrationYear] = useState('');
  const [vehicleLicense, setVehicleLicense] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [itvDate, setItvDate] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inicialización de Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Escuchar cambios en el estado de autenticación y cargar los datos
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Iniciar sesión con el token proporcionado por el entorno o de forma anónima
    const signIn = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Error al iniciar sesión:", error);
      }
    };
    
    signIn();
    return () => unsubscribe();
  }, [auth, initialAuthToken]);

  // Escuchar cambios en la base de datos (Firestore) en tiempo real
  useEffect(() => {
    if (user) {
      const userRef = collection(db, 'artifacts', appId, 'users', user.uid, 'inspections');
      const q = query(userRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const inspectionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInspections(inspectionsData);
      });

      return () => unsubscribe();
    } else {
      setInspections([]);
    }
  }, [user, db, appId]);
  
  // Agregar o actualizar una inspección en Firestore
  const handleAddOrUpdateInspection = async () => {
    if (!vehicleModel || !vehicleLicense || !user) return;

    const inspectionData = {
      vehicleBrand,
      vehicleModel,
      registrationYear,
      vehicleLicense,
      inspectionDate,
      itvDate,
      notes,
    };
    
    try {
      const docId = editingId || crypto.randomUUID();
      const inspectionRef = doc(db, 'artifacts', appId, 'users', user.uid, 'inspections', docId);
      await setDoc(inspectionRef, inspectionData);
      setEditingId(null);
      // Limpiar el formulario después de guardar
      setVehicleBrand('');
      setVehicleModel('');
      setRegistrationYear('');
      setVehicleLicense('');
      setInspectionDate('');
      setItvDate('');
      setNotes('');
    } catch (error) {
      console.error("Error al guardar la inspección:", error);
    }
  };

  // Editar una inspección
  const handleEdit = (inspection) => {
    setEditingId(inspection.id);
    setVehicleBrand(inspection.vehicleBrand);
    setVehicleModel(inspection.vehicleModel);
    setRegistrationYear(inspection.registrationYear);
    setVehicleLicense(inspection.vehicleLicense);
    setInspectionDate(inspection.inspectionDate);
    setItvDate(inspection.itvDate);
    setNotes(inspection.notes);
  };

  // Eliminar una inspección
  const handleDelete = async (id) => {
    if (!user) return;
    try {
      const inspectionRef = doc(db, 'artifacts', appId, 'users', user.uid, 'inspections', id);
      await deleteDoc(inspectionRef);
    } catch (error) {
      console.error("Error al eliminar la inspección:", error);
    }
  };

  // Función para calcular la fecha de la próxima ITV
  const getNextItvDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };
  
  // Función para generar un enlace de Google Calendar
  const createGoogleCalendarLink = (inspection) => {
    const nextItvDate = getNextItvDate(inspection.itvDate);
    if (!nextItvDate) return;

    const eventTitle = `Próxima ITV: ${inspection.vehicleBrand} ${inspection.vehicleModel} (${inspection.vehicleLicense})`;
    const eventDetails = `Fecha de la última ITV: ${inspection.itvDate}. Notas: ${inspection.notes || 'Ninguna'}`;
    const eventLocation = 'Taller de confianza';
    
    const startDate = nextItvDate.replace(/-/g, '');
    const endDate = new Date(nextItvDate);
    endDate.setDate(endDate.getDate() + 1);
    const endDateFormatted = endDate.toISOString().split('T')[0].replace(/-/g, '');
    
    const calendarUrl = new URL('https://www.google.com/calendar/render');
    calendarUrl.searchParams.append('action', 'TEMPLATE');
    calendarUrl.searchParams.append('text', eventTitle);
    calendarUrl.searchParams.append('details', eventDetails);
    calendarUrl.searchParams.append('location', eventLocation);
    calendarUrl.searchParams.append('dates', `${startDate}/${endDateFormatted}`);

    window.open(calendarUrl.toString(), '_blank');
  };

  // Extraer y ordenar las inspecciones por fecha de próxima ITV
  const upcomingInspections = inspections.filter(
    (inspection) => inspection.itvDate
  ).sort((a, b) => {
    const dateA = new Date(getNextItvDate(a.itvDate));
    const dateB = new Date(getNextItvDate(b.itvDate));
    return dateA - dateB;
  });

  // Función para generar una URL de imagen de coche
  const getVehicleImageUrl = (model) => {
    if (!model) {
      return 'https://placehold.co/200x120/4a5568/a0aec0?text=Coche';
    }
    const query = encodeURIComponent(model);
    return `https://placehold.co/200x120/4a5568/a0aec0?text=${query}`;
  };

  // Función para calcular la edad del vehículo de forma más robusta
  const getVehicleAge = (year) => {
    if (!year || isNaN(parseInt(year, 10))) return null;
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(year, 10);
    return age >= 0 ? age : null;
  };
  
  // Lógica de renderizado
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-medium text-gray-700">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4 font-sans flex flex-col items-center">
      <header className="w-full max-w-2xl flex justify-between items-center bg-white p-4 rounded-xl shadow-lg mt-8 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Registro de ITVs
        </h1>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 truncate">Hola, {user.displayName || 'Usuario anónimo'}</span>
          </div>
        )}
      </header>

      {user && (
        <>
          <div className="w-full max-w-2xl bg-white p-6 rounded-3xl shadow-lg mb-4">
             <div className="flex items-center space-x-2 bg-gray-200 p-3 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-key-round"><path d="M2 18v-3c0-1.1.9-2 2-2h3L10 6h4l1 1v4c0 1.1-.9 2-2 2H9l-3 4H2z"/><path d="M7 11.5L13.5 5 19 10.5 12.5 17 7 11.5z"/><circle cx="15.5" cy="8.5" r=".5" fill="currentColor"/></svg>
              <p className="text-gray-500 text-xs truncate">ID de Usuario: {user.uid}</p>
            </div>
          </div>
          <div className="w-full max-w-2xl bg-white p-6 rounded-3xl shadow-lg mt-4 mb-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
              Añadir nueva inspección
            </h2>
            <div className="space-y-4">
              {/* Nuevo campo: Marca del Vehículo */}
              <div className="flex items-center space-x-2 bg-gray-200 p-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tag"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.586 8.586a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828l-8.586-8.586Z" /><circle cx="7" cy="7" r="1" /></svg>
                <input
                  type="text"
                  value={vehicleBrand}
                  onChange={(e) => setVehicleBrand(e.target.value)}
                  placeholder="Marca del Vehículo"
                  className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500"
                />
              </div>

              <div className="flex items-center space-x-2 bg-gray-200 p-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-car"><path d="M19 17H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2z"/><circle cx="7" cy="15" r="2"/><circle cx="17" cy="15" r="2"/></svg>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="Modelo del Vehículo"
                  className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500"
                />
              </div>

              {/* Nuevo campo: Año de Matriculación con límite mínimo y máximo */}
              <div className="flex items-center space-x-2 bg-gray-200 p-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                <input
                  type="number"
                  value={registrationYear}
                  onChange={(e) => setRegistrationYear(e.target.value)}
                  placeholder="Año de Matriculación"
                  min="1960" // Límite mínimo para el año
                  max={new Date().getFullYear()} // Límite máximo para el año
                  className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500"
                />
              </div>

              <div className="flex items-center space-x-2 bg-gray-200 p-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tag"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.586 8.586a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828l-8.586-8.586Z" /><circle cx="7" cy="7" r="1" /></svg>
                <input
                  type="text"
                  value={vehicleLicense}
                  onChange={(e) => setVehicleLicense(e.target.value)}
                  placeholder="Matrícula del Coche"
                  className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500"
                />
              </div>
              <div className="flex items-center space-x-2 bg-gray-200 p-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
                <input
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  placeholder="Fecha de la Inspección"
                  className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500"
                />
              </div>
              <div className="flex items-center space-x-2 bg-gray-200 p-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2030/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell-ring"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /><path d="M21 8a2 2 0 0 0-2-2-2 2 0 0 0-2 2" /></svg>
                <input
                  type="date"
                  value={itvDate}
                  onChange={(e) => setItvDate(e.target.value)}
                  placeholder="Fecha de la última ITV"
                  className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500"
                />
              </div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas (Ej: Cambio de aceite, revisión de frenos)"
                className="w-full p-3 bg-gray-200 rounded-xl text-gray-800 placeholder-gray-500 outline-none"
              />
            </div>
            <button
              onClick={handleAddOrUpdateInspection}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              {editingId ? 'Guardar Cambios' : 'Agregar Inspección'}
            </button>
          </div>

          <div className="w-full max-w-2xl bg-white p-6 rounded-3xl shadow-lg mt-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Próximas ITVs
            </h2>
            {upcomingInspections.length > 0 ? (
              <div className="space-y-4">
                {upcomingInspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="bg-blue-100 p-4 rounded-xl shadow-sm flex items-center justify-between space-x-4"
                  >
                    <div className="flex-1 flex items-center space-x-4">
                      <img
                        src={getVehicleImageUrl(inspection.vehicleModel)}
                        alt={`Imagen de ${inspection.vehicleModel}`}
                        className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div>
                        <p className="font-bold text-lg text-blue-800">
                          {inspection.vehicleBrand} {inspection.vehicleModel} - {inspection.vehicleLicense}
                        </p>
                        <p className="text-blue-600">
                          Próxima ITV: <span className="font-bold">{getNextItvDate(inspection.itvDate)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4 flex-shrink-0">
                      <button
                        onClick={() => createGoogleCalendarLink(inspection)}
                        className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                        title="Añadir al Calendario de Google"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-check text-white"><path d="M21 14V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="m16 20 2 2 4-4" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-4">
                No hay ITVs registradas o pendientes.
              </p>
            )}
          </div>

          <div className="w-full max-w-2xl bg-white p-6 rounded-3xl shadow-lg mt-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Inspecciones Registradas
            </h2>
            {inspections.length > 0 ? (
              <div className="space-y-4">
                {inspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="bg-gray-200 p-4 rounded-xl flex items-center justify-between shadow-sm"
                  >
                    <div className="flex-1 flex items-center space-x-4">
                      <img
                        src={getVehicleImageUrl(inspection.vehicleModel)}
                        alt={`Imagen de ${inspection.vehicleModel}`}
                        className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-lg text-gray-800">
                          {inspection.vehicleBrand} {inspection.vehicleModel} - <span className="text-blue-600">{inspection.vehicleLicense}</span>
                        </p>
                        {inspection.registrationYear && getVehicleAge(inspection.registrationYear) !== null && (
                           <p className="text-gray-500">
                            Año: {inspection.registrationYear} ({getVehicleAge(inspection.registrationYear)} años)
                           </p>
                        )}
                        <p className="text-gray-500">
                          Fecha de Inspección: {inspection.inspectionDate}
                        </p>
                        {inspection.itvDate && (
                          <p className="text-gray-500">
                            Última ITV: {inspection.itvDate}
                          </p>
                        )}
                        {inspection.notes && (
                          <p className="text-gray-600 italic text-sm mt-1">
                            "{inspection.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(inspection)}
                        className="p-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil text-gray-700"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(inspection.id)}
                        className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2 text-white"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-4">
                No hay inspecciones registradas. ¡Agrega la primera!
              </p>
            )}
          </div>
        </>
      )}

      {!user && !loading && (
        <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-lg mt-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Cargando la sesión...
          </h2>
          <p className="text-gray-600 mb-6">
            Esperando la autenticación del entorno.
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
