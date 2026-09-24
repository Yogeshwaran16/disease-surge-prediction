import {
  getDashboardSummary,
  getDashboardRiskTrend,
} from "./api";


export {
  getDashboardSummary,
  getDashboardRiskTrend,
};


const dashboardService = {
  getSummary: getDashboardSummary,
  getRiskTrend: getDashboardRiskTrend,
};


export default dashboardService;