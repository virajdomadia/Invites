import { logger } from '@/utils/logger';
import { getEventCreationLogs } from '@/services/nativeEventCreation';

interface DebugInfo {
  eventCreationLogs: string;
  allLogs: string;
  eventCreationLogsCount: number;
  totalLogsCount: number;
}

export function useEventCreationDebug() {
  const getDebugInfo = (): DebugInfo => {
    const eventCreationLogs = getEventCreationLogs();
    const allLogs = logger.exportLogs();
    const eventCreationLogsCount = eventCreationLogs.split('\n').filter((line) => line.trim()).length;
    const totalLogsCount = allLogs.split('\n').filter((line) => line.trim()).length;

    return {
      eventCreationLogs,
      allLogs,
      eventCreationLogsCount,
      totalLogsCount,
    };
  };

  const clearAllLogs = () => {
    logger.clearLogs();
  };

  const printEventCreationLogs = () => {
    console.log('=== Event Creation Logs ===');
    console.log(getEventCreationLogs());
    console.log('===========================');
  };

  const printAllLogs = () => {
    console.log('=== All Logs ===');
    console.log(logger.exportLogs());
    console.log('================');
  };

  const exportLogsAsJSON = () => {
    return JSON.stringify(logger.getLogs(), null, 2);
  };

  return {
    getDebugInfo,
    clearAllLogs,
    printEventCreationLogs,
    printAllLogs,
    exportLogsAsJSON,
    getLogs: () => logger.getLogs(),
  };
}
