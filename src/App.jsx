import { useState, useEffect } from 'react';

// Componentes de la UI (simulados para React web)
const View = ({ children, className }) => <div className={className}>{children}</div>;
const Text = ({ children, className }) => <p className={className}>{children}</p>;
const TextInput = ({ value, onChange, placeholder, className, type = 'text' }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={className}
  />
);
const Button = ({ children, onClick, className }) => (
  <button onClick={onClick} className={className}>
    {children}
  </button>
);
const Image = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} />
);

// Iconos de Lucide
const CalendarDays = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </svg>
);
const Car = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-car">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L14 10" />
    <path d="M2 17l-1 0" />
    <path d="M6 18h2" />
    <path d="M12 18h4" />
    <path d="M18 18h2" />
    <path d="M3.5 17L21 17" />
    <path d="M6.5 10l-.9 3.5c-.3 1.1.3 2.2 1.4 2.5l1.6.4c1.1.3 2.2-.3 2.5-1.4l.9-3.5" />
    <path d="M14 10l.9 3.5c.3 1.1-.3 2.2-1.4 2.5l-1.6.4c-1.1.3-2.2-.3-2.5-1.4L9.5 10" />
    <path d="M19 12h-2" />
    <path d="M6.5 10c.6-1.5 2.1-2.2 3.5-1.7s2.2 2.1 1.7 3.5l-1.3 3.3c-.6 1.5-2.1 2.2-3.5 1.7s-2.2-2.1-1.7-3.5l1.3-3.3Z" />
    <path d="M14 10c.6-1.5 2.1-2.2 3.5-1.7s2.2 2.1 1.7 3.5l-1.3 3.3c-.6 1.5-2.1 2.2-3.5 1.7s-2.2-2.1-1.7-3.5l1.3-3.3Z" />
    <path d="M9.5 10l-1.3 3.3" />
  </svg>
);
const Tag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tag">
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.586 8.586a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828l-8.586-8.586Z" />
    <circle cx="7" cy="7" r="1" />
  </svg>
);
const Pencil = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);
const Trash2 = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);
const BellRing = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell-ring">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    <path d="M21 8a2 2 0 0 0-2-2-2 2 0 0 0-2 2" />
  </svg>
);
const CalendarCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-check">
    <path d="M21 14V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
    <path d="m16 20 2 2 4-4" />
  </svg>
);

const App = () => {
  const [inspections, setInspections] = useState([]);
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleLicense, setVehicleLicense] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [itvDate, setItvDate] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Cargar datos del almacenamiento local al inicio
  useEffect(() => {
    try {
      const storedInspections = JSON.parse(localStorage.getItem('vehicleInspections')) || [];
      setInspections(storedInspections);
    } catch (error) {
      console.error("Error al cargar las inspecciones del almacenamiento local:", error);
      setInspections([]);
    }
  }, []);

  // Función para guardar los datos en el almacenamiento local
  const saveToLocalStorage = (data) => {
    try {
      localStorage.setItem('vehicleInspections', JSON.stringify(data));
    } catch (error) {
      console.error("Error al guardar en el almacenamiento local:", error);
    }
  };

  // Función para agregar o actualizar una inspección
  const handleAddOrUpdateInspection = () => {
    if (!vehicleModel || !vehicleLicense) return;

    const newInspection = {
      id: editingId || crypto.randomUUID(),
      vehicleModel,
      vehicleLicense,
      inspectionDate,
      itvDate,
      notes,
    };

    let updatedInspections;
    if (editingId) {
      updatedInspections = inspections.map((inspection) =>
        inspection.id === editingId ? newInspection : inspection
      );
      setEditingId(null);
    } else {
      updatedInspections = [newInspection, ...inspections];
    }
    setInspections(updatedInspections);
    saveToLocalStorage(updatedInspections);

    // Limpiar el formulario
    setVehicleModel('');
    setVehicleLicense('');
    setInspectionDate('');
    setItvDate('');
    setNotes('');
  };

  // Función para editar una inspección
  const handleEdit = (inspection) => {
    setEditingId(inspection.id);
    setVehicleModel(inspection.vehicleModel);
    setVehicleLicense(inspection.vehicleLicense);
    setInspectionDate(inspection.inspectionDate);
    setItvDate(inspection.itvDate);
    setNotes(inspection.notes);
  };

  // Función para eliminar una inspección
  const handleDelete = (id) => {
    const updatedInspections = inspections.filter((inspection) => inspection.id !== id);
    setInspections(updatedInspections);
    saveToLocalStorage(updatedInspections);
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

    const eventTitle = `Próxima ITV: ${inspection.vehicleModel} (${inspection.vehicleLicense})`;
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

  return (
    <View className="min-h-screen bg-gray-100 text-gray-800 p-4 font-sans flex flex-col items-center">
      <View className="w-full max-w-2xl bg-white p-6 rounded-3xl shadow-lg mt-8 mb-4">
        <Text className="text-3xl font-bold text-center text-gray-800 mb-6">
          Registro de Inspecciones
        </Text>
        <View className="space-y-4">
          <View className="flex items-center space-x-2 bg-gray-200 p-3 rounded-xl">
            <Car className="text-gray-500" />
            <TextInput
              value={vehicleModel}
              onChange={setVehicleModel}
              placeholder="Modelo del Vehículo"
              className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500"
            />
          </View>
          <View className="flex items-center space-x-2 bg-gray-200 p-3 rounded-xl">
            <Tag className="text-gray-500" />
            <TextInput
              value={vehicleLicense}
              onChange={setVehicleLicense}
              placeholder="Matrícula del Coche"
              className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500"
            />
          </View>
          <View className="flex items-center space-x-2 bg-gray-200 p-3 rounded-xl">
            <CalendarDays className="text-gray-500" />
            <TextInput
              value={inspectionDate}
              onChange={setInspectionDate}
              placeholder="Fecha de la Inspección"
              type="date"
              className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500"
            />
          </View>
          <View className="flex items-center space-x-2 bg-gray-200 p-3 rounded-xl">
            <BellRing className="text-gray-500" />
            <TextInput
              value={itvDate}
              onChange={setItvDate}
              placeholder="Fecha de la última ITV"
              type="date"
              className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500"
            />
          </View>
          <TextInput
            value={notes}
            onChange={setNotes}
            placeholder="Notas (Ej: Cambio de aceite, revisión de frenos)"
            className="w-full p-3 bg-gray-200 rounded-xl text-gray-800 placeholder-gray-500"
          />
        </View>
        <Button
          onClick={handleAddOrUpdateInspection}
          className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors"
        >
          {editingId ? 'Guardar Cambios' : 'Agregar Inspección'}
        </Button>
      </View>

      <View className="w-full max-w-2xl bg-white p-6 rounded-3xl shadow-lg mt-4">
        <Text className="text-2xl font-bold text-gray-800 mb-4">
          Próximas ITVs
        </Text>
        {upcomingInspections.length > 0 ? (
          <View className="space-y-4">
            {upcomingInspections.map((inspection) => (
              <View
                key={inspection.id}
                className="bg-blue-100 p-4 rounded-xl shadow-sm flex items-center justify-between space-x-4"
              >
                <View className="flex-1 flex items-center space-x-4">
                  <Image
                    src={getVehicleImageUrl(inspection.vehicleModel)}
                    alt={`Imagen de ${inspection.vehicleModel}`}
                    className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                  <View>
                    <Text className="font-bold text-lg text-blue-800">
                      {inspection.vehicleModel} - {inspection.vehicleLicense}
                    </Text>
                    <Text className="text-blue-600">
                      Próxima ITV: <span className="font-bold">{getNextItvDate(inspection.itvDate)}</span>
                    </Text>
                  </View>
                </View>
                <View className="flex space-x-2 ml-4 flex-shrink-0">
                  <Button
                    onClick={() => createGoogleCalendarLink(inspection)}
                    className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    title="Añadir al Calendario de Google"
                  >
                    <CalendarCheck className="text-white" />
                  </Button>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-center text-gray-500 mt-4">
            No hay ITVs registradas o pendientes.
          </Text>
        )}
      </View>

      <View className="w-full max-w-2xl bg-white p-6 rounded-3xl shadow-lg mt-4">
        <Text className="text-2xl font-bold text-gray-800 mb-4">
          Inspecciones Registradas
        </Text>
        {inspections.length > 0 ? (
          <View className="space-y-4">
            {inspections.map((inspection) => (
              <View
                key={inspection.id}
                className="bg-gray-200 p-4 rounded-xl flex items-center justify-between shadow-sm"
              >
                <View className="flex-1 flex items-center space-x-4">
                  <Image
                    src={getVehicleImageUrl(inspection.vehicleModel)}
                    alt={`Imagen de ${inspection.vehicleModel}`}
                    className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                  <View className="flex-1">
                    <Text className="font-bold text-lg text-gray-800">
                      {inspection.vehicleModel} - <span className="text-blue-600">{inspection.vehicleLicense}</span>
                    </Text>
                    <Text className="text-gray-500">
                      Fecha de Inspección: {inspection.inspectionDate}
                    </Text>
                    {inspection.itvDate && (
                      <Text className="text-gray-500">
                        Última ITV: {inspection.itvDate}
                      </Text>
                    )}
                    {inspection.notes && (
                      <Text className="text-gray-600 italic text-sm mt-1">
                        "{inspection.notes}"
                      </Text>
                    )}
                  </View>
                </View>
                <View className="flex space-x-2 ml-4 flex-shrink-0">
                  <Button
                    onClick={() => handleEdit(inspection)}
                    className="p-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors"
                  >
                    <Pencil className="text-gray-700" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(inspection.id)}
                    className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="text-white" />
                  </Button>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-center text-gray-500 mt-4">
            No hay inspecciones registradas. ¡Agrega la primera!
          </Text>
        )}
      </View>
    </View>
  );
};

export default App;
