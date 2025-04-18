import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/lib/api-client";

export async function getUserAchievements() {
    const storedToken = await AsyncStorage.getItem('token');

    try {
        const response = await api.get('/User/get-achievements-for-user',
            {headers: {Authorization: `Bearer ${storedToken}`}});

        const newList = response;

        const storedAchieved = await AsyncStorage.getItem("achieved_ids");
        const achievedIds = storedAchieved ? JSON.parse(storedAchieved) : [];

        const updatedList = newList.map((ach: any) => {
            const isNew = ach.IsAchieved && !achievedIds.includes(ach.id);
            return { ...ach, isNew };
        });

        const allAchievedNow = updatedList
            .filter((a: any) => a.IsAchieved)
            .map((a: any) => a.id);

        await AsyncStorage.setItem("achieved_ids", JSON.stringify(allAchievedNow));

        return updatedList;
    } catch (error) {
        console.error("Не вдалося завантажити досягнення користувача:", error);
        return [];
    }
}
