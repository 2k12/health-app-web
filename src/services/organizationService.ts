import api from "./api";

export interface OrganizationConfig {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  restaurantUrl: string | null;
  nutritionDetails?: string;
}

export const organizationService = {
  getConfig: async (slug: string = "fitba") => {
    const response = await api.get<OrganizationConfig>(
      `/organization/config?slug=${slug}`
    );
    return response.data;
  },

  getAll: async () => {
    const response = await api.get<OrganizationConfig[]>("/organization");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<OrganizationConfig>(`/organization/${id}`);
    return response.data;
  },

  create: async (data: Partial<OrganizationConfig>) => {
    const response = await api.post<OrganizationConfig>("/organization", data);
    return response.data;
  },

  update: async (id: string, data: Partial<OrganizationConfig>) => {
    const response = await api.put<OrganizationConfig>(
      `/organization/${id}`,
      data
    );
    return response.data;
  },
};
