export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_access_logs: {
        Row: {
          created_at: string | null
          email: string
          failure_reason: string | null
          id: string
          ip_address: string | null
          session_duration: number | null
          status: string
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          session_duration?: number | null
          status: string
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          session_duration?: number | null
          status?: string
          timestamp?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          blocked_until: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          login_attempts: number | null
          name: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          login_attempts?: number | null
          name: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          blocked_until?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          login_attempts?: number | null
          name?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      app_config: {
        Row: {
          created_at: string | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      coal_provider_manufacturer_inquiries: {
        Row: {
          coal_provider_id: string
          coal_type: string | null
          created_at: string | null
          delivery_location: string | null
          expected_delivery_date: string | null
          id: string
          inquiry_type: string
          manufacturer_id: string
          message: string
          price_per_unit: number | null
          product_id: string | null
          quantity: number | null
          status: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          coal_provider_id: string
          coal_type?: string | null
          created_at?: string | null
          delivery_location?: string | null
          expected_delivery_date?: string | null
          id?: string
          inquiry_type?: string
          manufacturer_id: string
          message: string
          price_per_unit?: number | null
          product_id?: string | null
          quantity?: number | null
          status?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          coal_provider_id?: string
          coal_type?: string | null
          created_at?: string | null
          delivery_location?: string | null
          expected_delivery_date?: string | null
          id?: string
          inquiry_type?: string
          manufacturer_id?: string
          message?: string
          price_per_unit?: number | null
          product_id?: string | null
          quantity?: number | null
          status?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coal_provider_manufacturer_inquiries_coal_provider_id_fkey"
            columns: ["coal_provider_id"]
            isOneToOne: false
            referencedRelation: "coal_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coal_provider_manufacturer_inquiries_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coal_provider_manufacturer_inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      coal_provider_manufacturer_ratings: {
        Row: {
          coal_provider_id: string
          communication_rating: number | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          manufacturer_id: string
          payment_rating: number | null
          professionalism_rating: number | null
          rating: number
          review_text: string | null
          review_title: string | null
          updated_at: string | null
          would_work_again: boolean | null
        }
        Insert: {
          coal_provider_id: string
          communication_rating?: number | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          manufacturer_id: string
          payment_rating?: number | null
          professionalism_rating?: number | null
          rating: number
          review_text?: string | null
          review_title?: string | null
          updated_at?: string | null
          would_work_again?: boolean | null
        }
        Update: {
          coal_provider_id?: string
          communication_rating?: number | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          manufacturer_id?: string
          payment_rating?: number | null
          professionalism_rating?: number | null
          rating?: number
          review_text?: string | null
          review_title?: string | null
          updated_at?: string | null
          would_work_again?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "coal_provider_manufacturer_ratings_coal_provider_id_fkey"
            columns: ["coal_provider_id"]
            isOneToOne: false
            referencedRelation: "coal_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coal_provider_manufacturer_ratings_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      coal_providers: {
        Row: {
          additional_info: string | null
          biz_gst: string | null
          category: string | null
          city: string
          company_name: string
          country: string
          country_code: string | null
          created_at: string | null
          delivery_service_area: string | null
          district: string
          email: string
          exim_code: string | null
          fuel_types: string[] | null
          id: string
          name: string
          pan_no: string | null
          phone: string
          pincode: string
          state: string
          supply_capacity: string | null
          updated_at: string | null
        }
        Insert: {
          additional_info?: string | null
          biz_gst?: string | null
          category?: string | null
          city: string
          company_name: string
          country?: string
          country_code?: string | null
          created_at?: string | null
          delivery_service_area?: string | null
          district: string
          email: string
          exim_code?: string | null
          fuel_types?: string[] | null
          id?: string
          name: string
          pan_no?: string | null
          phone: string
          pincode: string
          state: string
          supply_capacity?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_info?: string | null
          biz_gst?: string | null
          category?: string | null
          city?: string
          company_name?: string
          country?: string
          country_code?: string | null
          created_at?: string | null
          delivery_service_area?: string | null
          district?: string
          email?: string
          exim_code?: string | null
          fuel_types?: string[] | null
          id?: string
          name?: string
          pan_no?: string | null
          phone?: string
          pincode?: string
          state?: string
          supply_capacity?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          additional_info: string | null
          company_name: string
          created_at: string | null
          district: string
          email: string
          id: string
          interested_in_exclusive_services: boolean | null
          joined_date: string | null
          kiln_type: string
          name: string
          phone: string
          state: string
        }
        Insert: {
          additional_info?: string | null
          company_name: string
          created_at?: string | null
          district: string
          email: string
          id?: string
          interested_in_exclusive_services?: boolean | null
          joined_date?: string | null
          kiln_type: string
          name: string
          phone: string
          state: string
        }
        Update: {
          additional_info?: string | null
          company_name?: string
          created_at?: string | null
          district?: string
          email?: string
          id?: string
          interested_in_exclusive_services?: boolean | null
          joined_date?: string | null
          kiln_type?: string
          name?: string
          phone?: string
          state?: string
        }
        Relationships: []
      }
      customers_auth: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          endcustomer_id: string
          id: string
          last_login: string | null
          phone: string
          phone_verified: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          endcustomer_id: string
          id?: string
          last_login?: string | null
          phone: string
          phone_verified?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          endcustomer_id?: string
          id?: string
          last_login?: string | null
          phone?: string
          phone_verified?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_auth_customer_id_fkey"
            columns: ["endcustomer_id"]
            isOneToOne: false
            referencedRelation: "endcustomers"
            referencedColumns: ["id"]
          },
        ]
      }
      endcustomers: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          district: string | null
          email: string | null
          gst_details: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          panno: string | null
          phone: string | null
          pin_code: string | null
          state: string | null
          updated_at: string | null
          vatno: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          district?: string | null
          email?: string | null
          gst_details?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          panno?: string | null
          phone?: string | null
          pin_code?: string | null
          state?: string | null
          updated_at?: string | null
          vatno?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          district?: string | null
          email?: string | null
          gst_details?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          panno?: string | null
          phone?: string | null
          pin_code?: string | null
          state?: string | null
          updated_at?: string | null
          vatno?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          manufacturer_id: string
          message: string
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          manufacturer_id: string
          message: string
          status?: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          manufacturer_id?: string
          message?: string
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "endcustomers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry_response_history: {
        Row: {
          coal_provider_id: string
          created_at: string | null
          id: string
          inquiry_id: string
          is_current_response: boolean | null
          manufacturer_id: string
          responded_by: string | null
          response_number: number
          response_text: string
          response_type: string | null
          updated_at: string | null
        }
        Insert: {
          coal_provider_id: string
          created_at?: string | null
          id?: string
          inquiry_id: string
          is_current_response?: boolean | null
          manufacturer_id: string
          responded_by?: string | null
          response_number?: number
          response_text: string
          response_type?: string | null
          updated_at?: string | null
        }
        Update: {
          coal_provider_id?: string
          created_at?: string | null
          id?: string
          inquiry_id?: string
          is_current_response?: boolean | null
          manufacturer_id?: string
          responded_by?: string | null
          response_number?: number
          response_text?: string
          response_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_response_history_coal_provider_id_fkey"
            columns: ["coal_provider_id"]
            isOneToOne: false
            referencedRelation: "coal_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_response_history_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "manufacturer_coal_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_response_history_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry_responses: {
        Row: {
          created_at: string | null
          created_by: string
          created_by_name: string | null
          id: string
          inquiry_id: string
          response_text: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          created_by_name?: string | null
          id?: string
          inquiry_id: string
          response_text: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          created_by_name?: string | null
          id?: string
          inquiry_id?: string
          response_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_responses_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      labour_contractor_inquiries: {
        Row: {
          budget_range: string | null
          client_email: string | null
          client_name: string
          client_phone: string
          created_at: string | null
          id: string
          labour_contractor_id: string
          location: string | null
          priority: string | null
          project_description: string
          response: string | null
          response_date: string | null
          service_type: string
          status: string
          timeline: string | null
          updated_at: string | null
        }
        Insert: {
          budget_range?: string | null
          client_email?: string | null
          client_name: string
          client_phone: string
          created_at?: string | null
          id?: string
          labour_contractor_id: string
          location?: string | null
          priority?: string | null
          project_description: string
          response?: string | null
          response_date?: string | null
          service_type: string
          status?: string
          timeline?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_range?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string
          created_at?: string | null
          id?: string
          labour_contractor_id?: string
          location?: string | null
          priority?: string | null
          project_description?: string
          response?: string | null
          response_date?: string | null
          service_type?: string
          status?: string
          timeline?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "labour_contractor_inquiries_labour_contractor_id_fkey"
            columns: ["labour_contractor_id"]
            isOneToOne: false
            referencedRelation: "labour_contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      labour_contractor_projects: {
        Row: {
          actual_cost: number | null
          client_contact: string | null
          client_name: string
          created_at: string | null
          end_date: string | null
          estimated_budget: number | null
          id: string
          inquiry_id: string | null
          labour_contractor_id: string
          location: string | null
          notes: string | null
          progress_percentage: number | null
          project_description: string | null
          project_name: string
          service_type: string
          start_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          client_contact?: string | null
          client_name: string
          created_at?: string | null
          end_date?: string | null
          estimated_budget?: number | null
          id?: string
          inquiry_id?: string | null
          labour_contractor_id: string
          location?: string | null
          notes?: string | null
          progress_percentage?: number | null
          project_description?: string | null
          project_name: string
          service_type: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          client_contact?: string | null
          client_name?: string
          created_at?: string | null
          end_date?: string | null
          estimated_budget?: number | null
          id?: string
          inquiry_id?: string | null
          labour_contractor_id?: string
          location?: string | null
          notes?: string | null
          progress_percentage?: number | null
          project_description?: string | null
          project_name?: string
          service_type?: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "labour_contractor_projects_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "labour_contractor_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labour_contractor_projects_labour_contractor_id_fkey"
            columns: ["labour_contractor_id"]
            isOneToOne: false
            referencedRelation: "labour_contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      labour_contractor_ratings: {
        Row: {
          client_name: string
          communication: number | null
          created_at: string | null
          id: string
          labour_contractor_id: string
          project_id: string | null
          rating: number
          review: string | null
          service_quality: number | null
          timeliness: number | null
          value_for_money: number | null
          would_recommend: boolean | null
        }
        Insert: {
          client_name: string
          communication?: number | null
          created_at?: string | null
          id?: string
          labour_contractor_id: string
          project_id?: string | null
          rating: number
          review?: string | null
          service_quality?: number | null
          timeliness?: number | null
          value_for_money?: number | null
          would_recommend?: boolean | null
        }
        Update: {
          client_name?: string
          communication?: number | null
          created_at?: string | null
          id?: string
          labour_contractor_id?: string
          project_id?: string | null
          rating?: number
          review?: string | null
          service_quality?: number | null
          timeliness?: number | null
          value_for_money?: number | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "labour_contractor_ratings_labour_contractor_id_fkey"
            columns: ["labour_contractor_id"]
            isOneToOne: false
            referencedRelation: "labour_contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labour_contractor_ratings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "labour_contractor_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      labour_contractors: {
        Row: {
          aadhar_no: string | null
          additional_info: string | null
          biz_gst: string | null
          category: string
          city: string
          company_name: string
          country: string
          created_at: string | null
          district: string
          email: string
          exim_code: string | null
          experience_years: string
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          pan_no: string | null
          phone: string
          pincode: string
          service_area: string
          service_types: string[]
          state: string
          updated_at: string | null
        }
        Insert: {
          aadhar_no?: string | null
          additional_info?: string | null
          biz_gst?: string | null
          category?: string
          city: string
          company_name: string
          country?: string
          created_at?: string | null
          district: string
          email: string
          exim_code?: string | null
          experience_years: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          pan_no?: string | null
          phone: string
          pincode: string
          service_area: string
          service_types: string[]
          state: string
          updated_at?: string | null
        }
        Update: {
          aadhar_no?: string | null
          additional_info?: string | null
          biz_gst?: string | null
          category?: string
          city?: string
          company_name?: string
          country?: string
          created_at?: string | null
          district?: string
          email?: string
          exim_code?: string | null
          experience_years?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          pan_no?: string | null
          phone?: string
          pincode?: string
          service_area?: string
          service_types?: string[]
          state?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      manufacturer_coal_inquiries: {
        Row: {
          budget_range_max: number | null
          budget_range_min: number | null
          coal_provider_id: string
          coal_type: string | null
          created_at: string | null
          delivery_location: string | null
          expected_delivery_date: string | null
          id: string
          inquiry_type: string
          manufacturer_id: string
          message: string
          product_id: string | null
          provider_response: string | null
          provider_response_date: string | null
          quantity: number | null
          responded_by: string | null
          status: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          budget_range_max?: number | null
          budget_range_min?: number | null
          coal_provider_id: string
          coal_type?: string | null
          created_at?: string | null
          delivery_location?: string | null
          expected_delivery_date?: string | null
          id?: string
          inquiry_type?: string
          manufacturer_id: string
          message: string
          product_id?: string | null
          provider_response?: string | null
          provider_response_date?: string | null
          quantity?: number | null
          responded_by?: string | null
          status?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_range_max?: number | null
          budget_range_min?: number | null
          coal_provider_id?: string
          coal_type?: string | null
          created_at?: string | null
          delivery_location?: string | null
          expected_delivery_date?: string | null
          id?: string
          inquiry_type?: string
          manufacturer_id?: string
          message?: string
          product_id?: string | null
          provider_response?: string | null
          provider_response_date?: string | null
          quantity?: number | null
          responded_by?: string | null
          status?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturer_coal_inquiries_coal_provider_id_fkey"
            columns: ["coal_provider_id"]
            isOneToOne: false
            referencedRelation: "coal_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_coal_inquiries_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_coal_inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturer_coal_orders: {
        Row: {
          actual_delivery_date: string | null
          coal_provider_id: string
          coal_type: string
          created_at: string | null
          delivery_location: string
          expected_delivery_date: string | null
          id: string
          manufacturer_id: string
          order_number: string
          order_status: string | null
          payment_status: string | null
          payment_terms: string | null
          price_per_unit: number
          product_id: string | null
          quantity: number
          quotation_id: string | null
          special_instructions: string | null
          total_amount: number
          unit: string
          updated_at: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          coal_provider_id: string
          coal_type: string
          created_at?: string | null
          delivery_location: string
          expected_delivery_date?: string | null
          id?: string
          manufacturer_id: string
          order_number: string
          order_status?: string | null
          payment_status?: string | null
          payment_terms?: string | null
          price_per_unit: number
          product_id?: string | null
          quantity: number
          quotation_id?: string | null
          special_instructions?: string | null
          total_amount: number
          unit: string
          updated_at?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          coal_provider_id?: string
          coal_type?: string
          created_at?: string | null
          delivery_location?: string
          expected_delivery_date?: string | null
          id?: string
          manufacturer_id?: string
          order_number?: string
          order_status?: string | null
          payment_status?: string | null
          payment_terms?: string | null
          price_per_unit?: number
          product_id?: string | null
          quantity?: number
          quotation_id?: string | null
          special_instructions?: string | null
          total_amount?: number
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturer_coal_orders_coal_provider_id_fkey"
            columns: ["coal_provider_id"]
            isOneToOne: false
            referencedRelation: "coal_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_coal_orders_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_coal_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_coal_orders_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "manufacturer_coal_quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturer_coal_quotations: {
        Row: {
          additional_notes: string | null
          coal_provider_id: string
          coal_type: string
          created_at: string | null
          delivery_location: string | null
          delivery_timeline: string | null
          id: string
          inquiry_id: string | null
          manufacturer_id: string
          payment_terms: string | null
          price_per_unit: number
          product_id: string | null
          quantity: number
          status: string | null
          total_amount: number
          unit: string
          updated_at: string | null
          validity_period: number | null
        }
        Insert: {
          additional_notes?: string | null
          coal_provider_id: string
          coal_type: string
          created_at?: string | null
          delivery_location?: string | null
          delivery_timeline?: string | null
          id?: string
          inquiry_id?: string | null
          manufacturer_id: string
          payment_terms?: string | null
          price_per_unit: number
          product_id?: string | null
          quantity: number
          status?: string | null
          total_amount: number
          unit: string
          updated_at?: string | null
          validity_period?: number | null
        }
        Update: {
          additional_notes?: string | null
          coal_provider_id?: string
          coal_type?: string
          created_at?: string | null
          delivery_location?: string | null
          delivery_timeline?: string | null
          id?: string
          inquiry_id?: string | null
          manufacturer_id?: string
          payment_terms?: string | null
          price_per_unit?: number
          product_id?: string | null
          quantity?: number
          status?: string | null
          total_amount?: number
          unit?: string
          updated_at?: string | null
          validity_period?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturer_coal_quotations_coal_provider_id_fkey"
            columns: ["coal_provider_id"]
            isOneToOne: false
            referencedRelation: "coal_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_coal_quotations_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "manufacturer_coal_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_coal_quotations_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_coal_quotations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturer_coal_ratings: {
        Row: {
          coal_provider_id: string
          created_at: string | null
          delivery_rating: number | null
          id: string
          is_verified: boolean | null
          manufacturer_id: string
          order_id: string
          quality_rating: number | null
          rating: number
          review_text: string | null
          review_title: string | null
          service_rating: number | null
          updated_at: string | null
          would_recommend: boolean | null
        }
        Insert: {
          coal_provider_id: string
          created_at?: string | null
          delivery_rating?: number | null
          id?: string
          is_verified?: boolean | null
          manufacturer_id: string
          order_id: string
          quality_rating?: number | null
          rating: number
          review_text?: string | null
          review_title?: string | null
          service_rating?: number | null
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          coal_provider_id?: string
          created_at?: string | null
          delivery_rating?: number | null
          id?: string
          is_verified?: boolean | null
          manufacturer_id?: string
          order_id?: string
          quality_rating?: number | null
          rating?: number
          review_text?: string | null
          review_title?: string | null
          service_rating?: number | null
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturer_coal_ratings_coal_provider_id_fkey"
            columns: ["coal_provider_id"]
            isOneToOne: false
            referencedRelation: "coal_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_coal_ratings_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_coal_ratings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "manufacturer_coal_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturer_profiles: {
        Row: {
          address: string | null
          biz_gst: string | null
          city: string
          company_name: string
          contact_person: string
          country: string
          created_at: string | null
          description: string | null
          district: string
          email: string
          exim_code: string | null
          id: string
          interested_in_exclusive_services: boolean | null
          interested_in_industry_quiz: boolean | null
          kiln_type: string
          manufacturer_id: string
          pan_no: string | null
          phone: string
          pin_code: string
          state: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          biz_gst?: string | null
          city: string
          company_name: string
          contact_person: string
          country?: string
          created_at?: string | null
          description?: string | null
          district: string
          email: string
          exim_code?: string | null
          id?: string
          interested_in_exclusive_services?: boolean | null
          interested_in_industry_quiz?: boolean | null
          kiln_type: string
          manufacturer_id: string
          pan_no?: string | null
          phone: string
          pin_code: string
          state: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          biz_gst?: string | null
          city?: string
          company_name?: string
          contact_person?: string
          country?: string
          created_at?: string | null
          description?: string | null
          district?: string
          email?: string
          exim_code?: string | null
          id?: string
          interested_in_exclusive_services?: boolean | null
          interested_in_industry_quiz?: boolean | null
          kiln_type?: string
          manufacturer_id?: string
          pan_no?: string | null
          phone?: string
          pin_code?: string
          state?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturer_profiles_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturer_transport_inquiries: {
        Row: {
          budget_range_max: number | null
          budget_range_min: number | null
          cargo_volume: number | null
          cargo_weight: number | null
          created_at: string | null
          delivery_location: string
          expected_delivery_date: string | null
          expected_pickup_date: string | null
          id: string
          inquiry_type: string
          manufacturer_id: string
          message: string
          pickup_location: string
          product_id: string | null
          status: string | null
          transport_provider_id: string
          transport_type: string | null
          updated_at: string | null
        }
        Insert: {
          budget_range_max?: number | null
          budget_range_min?: number | null
          cargo_volume?: number | null
          cargo_weight?: number | null
          created_at?: string | null
          delivery_location: string
          expected_delivery_date?: string | null
          expected_pickup_date?: string | null
          id?: string
          inquiry_type?: string
          manufacturer_id: string
          message: string
          pickup_location: string
          product_id?: string | null
          status?: string | null
          transport_provider_id: string
          transport_type?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_range_max?: number | null
          budget_range_min?: number | null
          cargo_volume?: number | null
          cargo_weight?: number | null
          created_at?: string | null
          delivery_location?: string
          expected_delivery_date?: string | null
          expected_pickup_date?: string | null
          id?: string
          inquiry_type?: string
          manufacturer_id?: string
          message?: string
          pickup_location?: string
          product_id?: string | null
          status?: string | null
          transport_provider_id?: string
          transport_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturer_transport_inquiries_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_transport_inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_transport_inquiries_transport_provider_id_fkey"
            columns: ["transport_provider_id"]
            isOneToOne: false
            referencedRelation: "transport_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturer_transport_orders: {
        Row: {
          actual_delivery_date: string | null
          actual_pickup_date: string | null
          cargo_description: string | null
          cargo_weight: number | null
          created_at: string | null
          delivery_location: string
          expected_delivery_date: string | null
          id: string
          manufacturer_id: string
          order_number: string
          order_status: string | null
          payment_status: string | null
          pickup_date: string | null
          pickup_location: string
          product_id: string | null
          quotation_id: string
          special_instructions: string | null
          total_cost: number
          tracking_number: string | null
          transport_provider_id: string
          transport_type: string
          updated_at: string | null
          vehicle_type: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          actual_pickup_date?: string | null
          cargo_description?: string | null
          cargo_weight?: number | null
          created_at?: string | null
          delivery_location: string
          expected_delivery_date?: string | null
          id?: string
          manufacturer_id: string
          order_number: string
          order_status?: string | null
          payment_status?: string | null
          pickup_date?: string | null
          pickup_location: string
          product_id?: string | null
          quotation_id: string
          special_instructions?: string | null
          total_cost: number
          tracking_number?: string | null
          transport_provider_id: string
          transport_type: string
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          actual_pickup_date?: string | null
          cargo_description?: string | null
          cargo_weight?: number | null
          created_at?: string | null
          delivery_location?: string
          expected_delivery_date?: string | null
          id?: string
          manufacturer_id?: string
          order_number?: string
          order_status?: string | null
          payment_status?: string | null
          pickup_date?: string | null
          pickup_location?: string
          product_id?: string | null
          quotation_id?: string
          special_instructions?: string | null
          total_cost?: number
          tracking_number?: string | null
          transport_provider_id?: string
          transport_type?: string
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturer_transport_orders_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_transport_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_transport_orders_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "manufacturer_transport_quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_transport_orders_transport_provider_id_fkey"
            columns: ["transport_provider_id"]
            isOneToOne: false
            referencedRelation: "transport_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturer_transport_quotations: {
        Row: {
          additional_notes: string | null
          base_charge: number | null
          cargo_capacity: number | null
          created_at: string | null
          delivery_location: string
          estimated_duration: string | null
          id: string
          inquiry_id: string
          manufacturer_id: string
          payment_terms: string | null
          pickup_location: string
          price_per_km: number | null
          product_id: string | null
          status: string | null
          total_estimated_cost: number
          transport_provider_id: string
          transport_type: string
          updated_at: string | null
          validity_period: number | null
          vehicle_type: string | null
        }
        Insert: {
          additional_notes?: string | null
          base_charge?: number | null
          cargo_capacity?: number | null
          created_at?: string | null
          delivery_location: string
          estimated_duration?: string | null
          id?: string
          inquiry_id: string
          manufacturer_id: string
          payment_terms?: string | null
          pickup_location: string
          price_per_km?: number | null
          product_id?: string | null
          status?: string | null
          total_estimated_cost: number
          transport_provider_id: string
          transport_type: string
          updated_at?: string | null
          validity_period?: number | null
          vehicle_type?: string | null
        }
        Update: {
          additional_notes?: string | null
          base_charge?: number | null
          cargo_capacity?: number | null
          created_at?: string | null
          delivery_location?: string
          estimated_duration?: string | null
          id?: string
          inquiry_id?: string
          manufacturer_id?: string
          payment_terms?: string | null
          pickup_location?: string
          price_per_km?: number | null
          product_id?: string | null
          status?: string | null
          total_estimated_cost?: number
          transport_provider_id?: string
          transport_type?: string
          updated_at?: string | null
          validity_period?: number | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturer_transport_quotations_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "manufacturer_transport_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_transport_quotations_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_transport_quotations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_transport_quotations_transport_provider_id_fkey"
            columns: ["transport_provider_id"]
            isOneToOne: false
            referencedRelation: "transport_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturer_transport_ratings: {
        Row: {
          created_at: string | null
          id: string
          is_verified: boolean | null
          manufacturer_id: string
          order_id: string
          punctuality_rating: number | null
          rating: number
          review_text: string | null
          review_title: string | null
          safety_rating: number | null
          service_rating: number | null
          transport_provider_id: string
          updated_at: string | null
          would_recommend: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          manufacturer_id: string
          order_id: string
          punctuality_rating?: number | null
          rating: number
          review_text?: string | null
          review_title?: string | null
          safety_rating?: number | null
          service_rating?: number | null
          transport_provider_id: string
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          manufacturer_id?: string
          order_id?: string
          punctuality_rating?: number | null
          rating?: number
          review_text?: string | null
          review_title?: string | null
          safety_rating?: number | null
          service_rating?: number | null
          transport_provider_id?: string
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturer_transport_ratings_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_transport_ratings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "manufacturer_transport_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_transport_ratings_transport_provider_id_fkey"
            columns: ["transport_provider_id"]
            isOneToOne: false
            referencedRelation: "transport_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturers: {
        Row: {
          additional_info: string | null
          biz_gst: string | null
          category: string | null
          city: string | null
          company_name: string
          country: string | null
          created_at: string | null
          district: string
          email: string
          exim_code: string | null
          id: string
          interested_in_exclusive_services: boolean | null
          interested_in_industry_quiz: boolean | null
          is_featured: boolean
          is_test_entry: boolean | null
          joined_date: string | null
          kiln_type: string
          latitude: number | null
          longitude: number | null
          name: string
          pan_no: string | null
          phone: string
          pincode: string | null
          state: string
          status: string
          updated_at: string | null
        }
        Insert: {
          additional_info?: string | null
          biz_gst?: string | null
          category?: string | null
          city?: string | null
          company_name: string
          country?: string | null
          created_at?: string | null
          district: string
          email: string
          exim_code?: string | null
          id?: string
          interested_in_exclusive_services?: boolean | null
          interested_in_industry_quiz?: boolean | null
          is_featured?: boolean
          is_test_entry?: boolean | null
          joined_date?: string | null
          kiln_type: string
          latitude?: number | null
          longitude?: number | null
          name: string
          pan_no?: string | null
          phone: string
          pincode?: string | null
          state: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          additional_info?: string | null
          biz_gst?: string | null
          category?: string | null
          city?: string | null
          company_name?: string
          country?: string | null
          created_at?: string | null
          district?: string
          email?: string
          exim_code?: string | null
          id?: string
          interested_in_exclusive_services?: boolean | null
          interested_in_industry_quiz?: boolean | null
          is_featured?: boolean
          is_test_entry?: boolean | null
          joined_date?: string | null
          kiln_type?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          pan_no?: string | null
          phone?: string
          pincode?: string | null
          state?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mobile_app_content: {
        Row: {
          action_text: string | null
          action_url: string | null
          content_type: string
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          priority: number | null
          start_date: string | null
          subtitle: string | null
          target_audience: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          action_text?: string | null
          action_url?: string | null
          content_type: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          start_date?: string | null
          subtitle?: string | null
          target_audience?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          action_text?: string | null
          action_url?: string | null
          content_type?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          start_date?: string | null
          subtitle?: string | null
          target_audience?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          contact_number: string
          created_at: string | null
          customer_id: string
          delivery_address: string
          id: string
          manufacturer_id: string
          price: number
          product_id: string
          quantity: number
          status: string
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          contact_number: string
          created_at?: string | null
          customer_id: string
          delivery_address: string
          id?: string
          manufacturer_id: string
          price: number
          product_id: string
          quantity: number
          status?: string
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_number?: string
          created_at?: string | null
          customer_id?: string
          delivery_address?: string
          id?: string
          manufacturer_id?: string
          price?: number
          product_id?: string
          quantity?: number
          status?: string
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "endcustomers"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          id: string
          phone: string
          used: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          phone: string
          used?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          phone?: string
          used?: boolean | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          dimensions: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          manufacturer_id: string
          name: string
          price: number | null
          price_unit: string | null
          specifications: Json | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          manufacturer_id: string
          name: string
          price?: number | null
          price_unit?: string | null
          specifications?: Json | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          manufacturer_id?: string
          name?: string
          price?: number | null
          price_unit?: string | null
          specifications?: Json | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          manufacturer_id: string
          message: string | null
          offer_expiry: string | null
          product_id: string
          quantity: number
          quoted_price: number
          responded_at: string | null
          response_message: string | null
          response_price: number | null
          response_quantity: number | null
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          manufacturer_id: string
          message?: string | null
          offer_expiry?: string | null
          product_id: string
          quantity: number
          quoted_price: number
          responded_at?: string | null
          response_message?: string | null
          response_price?: number | null
          response_quantity?: number | null
          status?: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          manufacturer_id?: string
          message?: string | null
          offer_expiry?: string | null
          product_id?: string
          quantity?: number
          quoted_price?: number
          responded_at?: string | null
          response_message?: string | null
          response_price?: number | null
          response_quantity?: number | null
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "endcustomers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      reach_us_form: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          phone: string | null
          subject: string
          updated_at: string | null
          user_category: string
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          phone?: string | null
          subject: string
          updated_at?: string | null
          user_category?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          phone?: string | null
          subject?: string
          updated_at?: string | null
          user_category?: string
        }
        Relationships: []
      }
      sample_orders: {
        Row: {
          admin_id: string | null
          admin_response: string | null
          contact_number: string
          created_at: string | null
          customer_id: string
          delivery_address: string
          id: string
          manufacturer_id: string
          price: number | null
          product_id: string
          quantity: number
          status: string
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          admin_id?: string | null
          admin_response?: string | null
          contact_number: string
          created_at?: string | null
          customer_id: string
          delivery_address: string
          id?: string
          manufacturer_id: string
          price?: number | null
          product_id: string
          quantity: number
          status?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string | null
          admin_response?: string | null
          contact_number?: string
          created_at?: string | null
          customer_id?: string
          delivery_address?: string
          id?: string
          manufacturer_id?: string
          price?: number | null
          product_id?: string
          quantity?: number
          status?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sample_orders_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "endcustomers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_orders_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_provider_manufacturer_inquiries: {
        Row: {
          capacity_range: string | null
          coverage_area: string | null
          created_at: string | null
          id: string
          inquiry_type: string
          manufacturer_id: string
          message: string
          minimum_charge: number | null
          price_per_km: number | null
          product_id: string | null
          service_type: string | null
          status: string | null
          transport_provider_id: string
          updated_at: string | null
          vehicle_types: string[] | null
        }
        Insert: {
          capacity_range?: string | null
          coverage_area?: string | null
          created_at?: string | null
          id?: string
          inquiry_type?: string
          manufacturer_id: string
          message: string
          minimum_charge?: number | null
          price_per_km?: number | null
          product_id?: string | null
          service_type?: string | null
          status?: string | null
          transport_provider_id: string
          updated_at?: string | null
          vehicle_types?: string[] | null
        }
        Update: {
          capacity_range?: string | null
          coverage_area?: string | null
          created_at?: string | null
          id?: string
          inquiry_type?: string
          manufacturer_id?: string
          message?: string
          minimum_charge?: number | null
          price_per_km?: number | null
          product_id?: string | null
          service_type?: string | null
          status?: string | null
          transport_provider_id?: string
          updated_at?: string | null
          vehicle_types?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_provider_manufacturer_inqu_transport_provider_id_fkey"
            columns: ["transport_provider_id"]
            isOneToOne: false
            referencedRelation: "transport_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_provider_manufacturer_inquiries_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_provider_manufacturer_inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_provider_manufacturer_ratings: {
        Row: {
          communication_rating: number | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          manufacturer_id: string
          payment_rating: number | null
          professionalism_rating: number | null
          rating: number
          review_text: string | null
          review_title: string | null
          transport_provider_id: string
          updated_at: string | null
          would_work_again: boolean | null
        }
        Insert: {
          communication_rating?: number | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          manufacturer_id: string
          payment_rating?: number | null
          professionalism_rating?: number | null
          rating: number
          review_text?: string | null
          review_title?: string | null
          transport_provider_id: string
          updated_at?: string | null
          would_work_again?: boolean | null
        }
        Update: {
          communication_rating?: number | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          manufacturer_id?: string
          payment_rating?: number | null
          professionalism_rating?: number | null
          rating?: number
          review_text?: string | null
          review_title?: string | null
          transport_provider_id?: string
          updated_at?: string | null
          would_work_again?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_provider_manufacturer_rati_transport_provider_id_fkey"
            columns: ["transport_provider_id"]
            isOneToOne: false
            referencedRelation: "transport_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_provider_manufacturer_ratings_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_providers: {
        Row: {
          additional_info: string | null
          biz_gst: string | null
          category: string | null
          city: string
          company_name: string
          country: string
          country_code: string | null
          created_at: string | null
          district: string
          email: string
          exim_code: string | null
          id: string
          name: string
          pan_no: string | null
          phone: string
          pincode: string
          service_area: string
          state: string
          transport_type: string
          transport_types: string[] | null
          updated_at: string | null
          vehicle_capacity: string | null
        }
        Insert: {
          additional_info?: string | null
          biz_gst?: string | null
          category?: string | null
          city: string
          company_name: string
          country?: string
          country_code?: string | null
          created_at?: string | null
          district: string
          email: string
          exim_code?: string | null
          id?: string
          name: string
          pan_no?: string | null
          phone: string
          pincode: string
          service_area: string
          state: string
          transport_type: string
          transport_types?: string[] | null
          updated_at?: string | null
          vehicle_capacity?: string | null
        }
        Update: {
          additional_info?: string | null
          biz_gst?: string | null
          category?: string | null
          city?: string
          company_name?: string
          country?: string
          country_code?: string | null
          created_at?: string | null
          district?: string
          email?: string
          exim_code?: string | null
          id?: string
          name?: string
          pan_no?: string | null
          phone?: string
          pincode?: string
          service_area?: string
          state?: string
          transport_type?: string
          transport_types?: string[] | null
          updated_at?: string | null
          vehicle_capacity?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string
          pincode: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone: string
          pincode?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          pincode?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      website_content: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_access_stats: {
        Row: {
          blocked_attempts: number | null
          email: string | null
          failed_attempts: number | null
          last_attempt: string | null
          last_successful_login: string | null
          successful_logins: number | null
          total_attempts: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_all_red_brick_buyers: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          created_at: string
        }[]
      }
      get_table_columns: {
        Args: { table_name: string }
        Returns: {
          column_name: string
          data_type: string
          is_nullable: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
