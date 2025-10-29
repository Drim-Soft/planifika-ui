export default function ConfirmDeleteModal({ project, onClose, onConfirm }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-lg font-semibold mb-3">Eliminar Proyecto</h2>
        <p className="mb-4">
          ¿Seguro que deseas eliminar <b>{project.name}</b>?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="bg-gray-300 px-4 py-1 rounded">Cancelar</button>
          <button onClick={onConfirm} className="bg-red-600 text-white px-4 py-1 rounded">Eliminar</button>
        </div>
      </div>
    </div>
  );
}
