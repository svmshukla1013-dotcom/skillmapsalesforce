public with sharing class SkillMapDataService {

    private static final String DEFAULT_OCCUPATION_CODE = '13-2099.04';

    public class OccupationOverviewData {
        public Occupation__c occupation;
        public List<Occupation_Skill__c> skills;
        public List<Occupation_Knowledge__c> knowledge;
        public List<Occupation_Ability__c> abilities;
        public List<Occupation_Task__c> tasks;
        public List<Software__c> software;
        public List<Occupation_Work_Context__c> workContext;
    }

    public static Occupation__c getOccupation() {
        List<Occupation__c> occupations = [
            SELECT
                Id,
                Name,
                Occupation_Code__c,
                Description__c
            FROM Occupation__c
            WHERE Occupation_Code__c = :DEFAULT_OCCUPATION_CODE
            LIMIT 1
        ];

        return occupations.isEmpty()
            ? null
            : occupations[0];
    }

    public static OccupationOverviewData getOccupationOverviewData(Id occupationId) {
        OccupationOverviewData data = new OccupationOverviewData();

        data.occupation = [
            SELECT Id, Name, Description__c
            FROM Occupation__c
            WHERE Id = :occupationId
            LIMIT 1
        ];

        data.skills = [
            SELECT Id, Name, Importance__c, Skill_Description__c
            FROM Occupation_Skill__c
            WHERE Occupation__c = :occupationId
            ORDER BY Importance__c DESC
            LIMIT 5
        ];

        data.knowledge = [
            SELECT Id, Name, Importance__c, Knowledge_Description__c
            FROM Occupation_Knowledge__c
            WHERE Occupation__c = :occupationId
            ORDER BY Importance__c DESC
            LIMIT 5
        ];

        data.abilities = [
            SELECT Id, Ability_Name__c, Importance__c, Ability_Description__c
            FROM Occupation_Ability__c
            WHERE Occupation__c = :occupationId
            ORDER BY Importance__c DESC
            LIMIT 5
        ];

        data.tasks = [
            SELECT Id, Occupation_Task__c, Importance__c, Category__c
            FROM Occupation_Task__c
            WHERE Occupation__c = :occupationId
            ORDER BY Importance__c DESC
            LIMIT 5
        ];

        data.software = [
            SELECT Id, Name, Category__c, Hot_Technology__c, In_Demand__c
            FROM Software__c
            WHERE Occupation__c = :occupationId
            ORDER BY Name
            LIMIT 5
        ];

        data.workContext = [
            SELECT Id, Work_Context__c, Work_Context_Description__c
            FROM Occupation_Work_Context__c
            WHERE Occupation__c = :occupationId
            ORDER BY Work_Context__c
            LIMIT 5
        ];

        return data;
    }
}