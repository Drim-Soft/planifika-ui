
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {ChevronLeft, ChevronRight, LogOut, UserCircle, Edit2, LifeBuoy, Plus, Calendar, Building2} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ticketService } from "../services/ticketService";
import { TicketResponse } from "../types/ticket";
import CreateTicketModal from "./CreateTicketModal";
import TicketModal from "./TicketModal";
import OrganizationModal from "./OrganizationModal";
import { organizationService } from "../services/organizationService";
import {UserRole} from "@/app/types/auth";

type SidebarProfileProps = {
    hideEdit?: boolean;
    roleLabel?: string;
    dashboardHref?: string;
};

export default function SidebarProfile({
                                           hideEdit = false,
                                           roleLabel,
                                           dashboardHref = "/dashboard/external"
                                       }: SidebarProfileProps) {
    const { user, logout } = useAuth();
    const router = useRouter();
    // Sanitizar URL de foto para evitar espacios iniciales que rompen Next Image
    const sanitizedPhotoUrl = (user?.photoUrl || '').trim();
    const [collapsed, setCollapsed] = useState(false);
    const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(null);
    const [tickets, setTickets] = useState<TicketResponse[]>([]);
    const [isLoadingTickets, setIsLoadingTickets] = useState(false);
    const [isCreatingTicket, setIsCreatingTicket] = useState(false);
    const [showTicketsList, setShowTicketsList] = useState(false);
    const [showOrgModal, setShowOrgModal] = useState(false);
    const [editingOrg, setEditingOrg] = useState<any>(null);

    // Determinar el label del rol dinámicamente
    const getUserRoleLabel = () => {
        // Si se proporciona un label específico, usarlo
        if (roleLabel) return roleLabel;

        // Si no, determinar basado en el rol del usuario
        if (!user) return "Usuario";

        switch (user.role) {
            case UserRole.ADMIN:
                return "Administrador";
            case UserRole.EXTERNAL:
                return "Usuario Externo";
            case UserRole.COLLABORATOR:
                return "Estudiante";
            default:
                return "Usuario";
        }
    };

    const currentRoleLabel = getUserRoleLabel();

    // Determinar si mostrar "Editar Perfil" basado en el rol real
    const shouldShowEditProfile = !hideEdit && user?.role === UserRole.EXTERNAL;
    const canEditOrganization = user?.role === UserRole.ADMIN && !!user?.organizationId;

    // Verificar si el usuario tiene acceso a tareas
    const hasTaskAccess = user?.role === UserRole.EXTERNAL || user?.role === UserRole.COLLABORATOR;

    // Cargar tickets del usuario
    useEffect(() => {
        if (user?.id) {
            loadUserTickets();
        }
    }, [user?.id]);

    const loadUserTickets = async () => {
        if (!user?.id) return;

        try {
            setIsLoadingTickets(true);
            const userTickets = await ticketService.getTicketsByUser(user.id);
            setTickets(userTickets);
        } catch (error) {
            console.error('Error loading tickets:', error);
        } finally {
            setIsLoadingTickets(false);
        }
    };

    const handleCreateTicket = async (data: { title: string; description: string }) => {
        if (!user?.id) {
            throw new Error('Usuario no autenticado');
        }

        try {
            setIsCreatingTicket(true);
            await ticketService.createTicket({
                idPlanifikaUser: user.id,
                title: data.title,
                description: data.description,
            });

            // Recargar tickets después de crear uno nuevo
            await loadUserTickets();

            // Cerrar modal
            setShowCreateTicketModal(false);
        } catch (error) {
            console.error('Error creating ticket:', error);
            throw error;
        } finally {
            setIsCreatingTicket(false);
        }
    };

    const handleViewTicket = (ticket: TicketResponse) => {
        setSelectedTicket(ticket);
        setShowTicketModal(true);
        setShowTicketsList(false);
    };

    // Organización: abrir modal para editar
    const handleOpenOrganization = async () => {
        if (!user?.organizationId) {
            // Si el admin no tiene organización, enviar a crear
            router.push('/create-organization');
            return;
        }
        try {
            const org = await organizationService.getOrganizationById(user.organizationId);
            setEditingOrg({
                IDOrganization: (org as any).IDOrganization ?? (org as any).id ?? user.organizationId,
                nit: (org as any).nit ?? "",
                name: (org as any).name ?? "",
                address: (org as any).address ?? "",
                phone: (org as any).phone ?? "",
                photoURL: (org as any).photoURL ?? "",
                domain: (org as any).domain ?? "",
            });
            setShowOrgModal(true);
        } catch (e) {
            console.error('Error cargando organización:', e);
            alert('No se pudo cargar la organización');
        }
    };

    const handleSaveOrganization = async (data: any) => {
        if (!user?.organizationId) return;
        try {
            await organizationService.updateOrganization(user.organizationId, data);
            setShowOrgModal(false);
        } catch (e) {
            console.error('Error actualizando organización:', e);
            alert('Error al actualizar la organización');
        }
    };

    return (
        <aside className={`bg-gradient-to-b from-[#222831] to-[#1a1f26] text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} h-screen sticky top-0 flex-shrink-0 flex flex-col shadow-2xl z-30`}>
            {/* Header con foto y nombre */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        {hideEdit ? (
                            <div>
                                {/* Wrapper cuadrado para asegurar círculo perfecto */}
                                <div className={`${collapsed ? 'w-10 h-10' : 'w-16 h-16'} rounded-full overflow-hidden border-2 border-[#FFD369] ${collapsed ? 'bg-white' : 'bg-transparent'} flex items-center justify-center shrink-0`}>
                                    {collapsed ? (
                                        <Image
                                            src="/assets/images/planifika_logo.png"
                                            alt="Logo Planifika"
                                            width={collapsed ? 40 : 64}
                                            height={collapsed ? 40 : 64}
                                            className="object-contain p-1"
                                        />
                                    ) : sanitizedPhotoUrl ? (
                                        sanitizedPhotoUrl.startsWith('http') ? (
                                            <img
                                                src={sanitizedPhotoUrl}
                                                alt="Foto de perfil"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Image
                                                src={sanitizedPhotoUrl}
                                                alt="Foto de perfil"
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        )
                                    ) : (
                                        <UserCircle className="w-full h-full text-[#FFD369]" />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <Link href="/dashboard/profile">
                                {/* Wrapper cuadrado para asegurar círculo perfecto */}
                                <div className={`${collapsed ? 'w-10 h-10' : 'w-16 h-16'} rounded-full overflow-hidden border-2 border-[#FFD369] ${collapsed ? 'bg-white' : 'bg-transparent'} flex items-center justify-center shrink-0`}>
                                    {collapsed ? (
                                        // En modo colapsado mostrar logo Planifika sobre fondo blanco
                                        <Image
                                            src="/assets/images/planifika_logo.png"
                                            alt="Logo Planifika"
                                            width={collapsed ? 40 : 64}
                                            height={collapsed ? 40 : 64}
                                            className="object-contain p-1"
                                        />
                                    ) : sanitizedPhotoUrl ? (
                                        sanitizedPhotoUrl.startsWith('http') ? (
                                            // Remoto: usar <img>
                                            <img
                                                src={sanitizedPhotoUrl}
                                                alt="Foto de perfil"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            // Local: usar <Image> de Next
                                            <Image
                                                src={sanitizedPhotoUrl}
                                                alt="Foto de perfil"
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        )
                                    ) : (
                                        <UserCircle className="w-full h-full text-[#FFD369]" />
                                    )}
                                </div>
                                {/* Icono editar al pasar mouse */}
                                {!collapsed && !hideEdit && (
                                    <span className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Edit2 className="w-5 h-5 text-[#FFD369] bg-black bg-opacity-60 rounded-full p-1" />
                </span>
                                )}
                            </Link>
                        )}
                    </div>
                    {!collapsed && (
                        <div className="ml-2">
                            <p className="text-base font-semibold text-[#FFD369]">{user?.name}</p>
                            <p className="text-xs text-gray-400">{currentRoleLabel}</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setCollapsed((c) => !c)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    title={collapsed ? "Expandir" : "Comprimir"}
                >
                    {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>

            {/* Opciones */}
            <nav className="flex-1 flex flex-col gap-2 px-2 mt-6 overflow-y-auto">
                <Link href={dashboardHref} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[#FFD369]/10 text-gray-200 text-sm font-medium">
                    <UserCircle className="w-5 h-5 text-[#FFD369]" />
                    {!collapsed && <span>Dashboard</span>}
                </Link>

                {/* Botón de Tareas - Solo para EXTERNAL y COLLABORATOR */}
                {hasTaskAccess && (
                    <Link href="/tasks" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[#FFD369]/10 text-gray-200 text-sm font-medium">
                        <Calendar className="w-5 h-5 text-[#FFD369]" />
                        {!collapsed && <span>Mis Tareas</span>}
                    </Link>
                )}

                {/* Mostrar "Editar Perfil" solo para usuarios EXTERNAL */}
                {shouldShowEditProfile && (
                    <Link href="/dashboard/profile" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[#FFD369]/10 text-gray-200 text-sm font-medium">
                        <Edit2 className="w-5 h-5 text-[#FFD369]" />
                        {!collapsed && <span>Editar Perfil</span>}
                    </Link>
                )}

                {/* Organización (solo Admin con organización) */}
                {canEditOrganization && (
                    <button
                        onClick={handleOpenOrganization}
                        className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[#FFD369]/10 text-gray-200 text-sm font-medium"
                    >
                        <Building2 className="w-5 h-5 text-[#FFD369]" />
                        {!collapsed && <span>Organización</span>}
                    </button>
                )}

                {/* Sección de Soporte */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-2 px-3">
                        {!collapsed && <p className="text-xs text-gray-400 font-semibold uppercase">Soporte</p>}
                        <button
                            onClick={() => setShowCreateTicketModal(true)}
                            className="p-1.5 hover:bg-[#FFD369]/10 rounded-lg transition-colors"
                            title="Crear ticket"
                        >
                            <Plus className="w-4 h-4 text-[#FFD369]" />
                        </button>
                    </div>

                    {/* Botón de tickets */}
                    <button
                        onClick={() => setShowTicketsList(!showTicketsList)}
                        className="w-full flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[#FFD369]/10 text-gray-200 text-sm font-medium relative"
                    >
                        <LifeBuoy className="w-5 h-5 text-[#FFD369]" />
                        {!collapsed && (
                            <>
                                <span>Mis Tickets</span>
                                {tickets.length > 0 && (
                                    <span className="ml-auto bg-[#FFD369] text-[#222831] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {tickets.length}
                  </span>
                                )}
                            </>
                        )}
                    </button>

                    {/* Lista de tickets (expandible) */}
                    {showTicketsList && !collapsed && (
                        <div className="mt-2 ml-2 space-y-1 max-h-64 overflow-y-auto">
                            {isLoadingTickets ? (
                                <div className="px-3 py-2 text-xs text-gray-400">Cargando...</div>
                            ) : tickets.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-gray-400">No hay tickets</div>
                            ) : (
                                tickets.map((ticket) => (
                                    <button
                                        key={ticket.idTickets}
                                        onClick={() => handleViewTicket(ticket)}
                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FFD369]/5 transition-colors group"
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className="text-xs text-gray-400">#{ticket.idTickets}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-300 truncate group-hover:text-[#FFD369]">
                                                    {ticket.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {ticket.ticketStatusName || 'Pendiente'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 p-2 w-full text-gray-300 hover:bg-gray-700 hover:text-white rounded-xl transition-all duration-200 group"
                >
                    <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                    {!collapsed && <span className="font-medium">Cerrar Sesión</span>}
                </button>
            </div>

            {/* Modales */}
            <CreateTicketModal
                isOpen={showCreateTicketModal}
                onClose={() => setShowCreateTicketModal(false)}
                onSubmit={handleCreateTicket}
                isLoading={isCreatingTicket}
            />

            <TicketModal
                isOpen={showTicketModal}
                onClose={() => {
                    setShowTicketModal(false);
                    setSelectedTicket(null);
                }}
                ticket={selectedTicket}
            />
            {showOrgModal && (
                <OrganizationModal
                    isOpen={showOrgModal}
                    onClose={() => { setShowOrgModal(false); setEditingOrg(null); }}
                    onSave={handleSaveOrganization}
                    editingOrganization={editingOrg}
                />
            )}
        </aside>
    );
}