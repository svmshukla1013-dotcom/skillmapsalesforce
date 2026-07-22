public with sharing class SkillMapResponseService {
    public SkillMapResponseService() {

    }

    public static String buildObjectOverview(SkillMapDataService.OccupationOverviewData data) {
        if (data == null || data.occupation == null) {
            return 'I could not find the occupation data in Salesforce.';
        }

        String answer =
            'This occupation is ' + data.occupation.Name + '.';

        if (!String.isBlank(data.occupation.Description__c)) {
            answer += ' ' + data.occupation.Description__c;
        }

        answer +=
            ' The related records explain how this occupation is defined in the system. ' +
            'Skills show the capabilities that matter most, knowledge stores the subject matter needed, abilities capture the personal capabilities involved, tasks describe the main responsibilities, software lists the tools used, and work context explains the environment in which the work happens. ' +
            'Together, these records help the AceInt Interview Management app connect job requirements to interview planning, candidate matching, and role understanding. ' +
            'Would you like me to break down the skills, knowledge, abilities, tasks, software, or work context in more detail?';

        return answer;
    }
}