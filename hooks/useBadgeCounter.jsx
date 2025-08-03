/* eslint-disable react-hooks/rules-of-hooks */
import { getStoredUser } from "./getStoredUser";
import { useRequests } from "./useRequests";

const storedUser = getStoredUser();
export default function useBadgeCounter() {
    const { useGetAssignedRequests, useGetAllRequests } = useRequests();
    const { data: requests = [] } = storedUser.role === 'admin' 
        ? useGetAllRequests()
        : useGetAssignedRequests(storedUser.id);

    const getNewRequests = () => {
        return requests.filter(req => req.isNew).length;
    }
    const getNewOngoingCount = () => {
        return requests.filter(req => req.isNew && req.status === 'in progress').length;
    }
    const getNewSettledCount = () => {
        return requests.filter(req => req.isNew && req.status === 'done').length;
    }
    const getNewStarredCount = () => {
        return requests.filter(req => req.isNew && req.isStarred).length;
    }
    const getNewSpamCount = () => {
        return requests.filter(req => req.isNew && req.isSpam).length;
    }
    const getNewTotalCount = () => {
        return requests.filter(req => req.isNew).length;
    }
    const getNewFraudCount = () => {
        return requests.filter(req => req.isNew && req.labels === 'fraud').length;
    }
    const getNewThreatCount = () => {
        return requests.filter(req => req.isNew && req.labels === 'threat').length;
    }
    const getNewAccidentCount = () => {
        return requests.filter(req => req.isNew && req.labels === 'accident').length;
    }

    return {
        getNewRequests,
        getNewOngoingCount,
        getNewSettledCount,
        getNewStarredCount,
        getNewSpamCount,
        getNewTotalCount,
        getNewFraudCount,
        getNewThreatCount,
        getNewAccidentCount,
    }
}