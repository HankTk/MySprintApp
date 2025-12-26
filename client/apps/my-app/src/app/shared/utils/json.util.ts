/**
 * Utility functions for JSON data formatting
 */
export class JsonUtil
{
  /**
   * Formats JSON data as a formatted string
   * @param jsonData - JSON data to format (can be string, object, or any type)
   * @returns Formatted JSON string or string representation of the data
   */
  static formatJsonData(jsonData: any): string
 {
    try 
{
      if (typeof jsonData === 'string')
      {
        return JSON.stringify(JSON.parse(jsonData), null, 2);
      }
 else
 {
        return JSON.stringify(jsonData, null, 2);
      }
    }
 catch
 {
      return String(jsonData);
    }
  }
}
