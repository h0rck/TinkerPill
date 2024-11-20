
export function jsonTransformService(dataString: string) {
      // Divida a string entre meta (texto não JSON) e o JSON real
      const splitIndex = dataString.indexOf('{');

      if (splitIndex === -1) {
          throw new Error('No JSON found in the string.');
      }
  
      const meta = dataString.slice(0, splitIndex).trim(); // Parte antes do JSON
      const jsonPart = dataString.slice(splitIndex).trim(); // Parte JSON
  
      try {
          const parsedJson = JSON.parse(jsonPart);
          return { meta, json: parsedJson };
      } catch (error) {
          throw new Error('Invalid JSON');
      }

}