import api from "./api";


export const getAuditLogs = async () => {

   try{

      const response = await api.get(
         "/logs"
      );

      return response.data;

   }

   catch(error){

      console.error(
         "Error cargando auditoría",
         error
      );

      throw error;

   }

};



export const getCriticalLogs = async () => {

   try{

      const response = await api.get(
         "/logs"
      );

      return response.data.filter(
         log =>
            log.severidad==="ALTA" ||
            log.severidad==="CRITICA"
      );

   }

   catch(error){

      console.error(
         "Error cargando logs críticos",
         error
      );

      throw error;

   }

};