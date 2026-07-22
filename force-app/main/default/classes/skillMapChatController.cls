public with sharing class SkillMapChatController {

    @AuraEnabled
    public static String answerQuestion(String question) {
        if (String.isBlank(question)) {
            return 'Please enter a question.';
        }

        Occupation__c occupation =
            SkillMapDataService.getOccupation();

        if (occupation == null) {
            return 'The occupation was not found in Salesforce.';
        }

        SkillMapIntentService.ChatIntent intent =
            SkillMapIntentService.detectIntent(question);

        switch on intent {
            when SKILL_COUNT {
                return getSkillCount(occupation.Id);
            }

            when KNOWLEDGE_COUNT {
                return getKnowledgeCount(occupation.Id);
            }

            when ABILITY_COUNT {
                return getAbilityCount(occupation.Id);
            }

            when TASK_COUNT {
                return getTaskCount(occupation.Id);
            }

            when SKILL_EXPLANATION {
                return getSkills(occupation.Id);
            }

            when KNOWLEDGE_EXPLANATION {
                return getKnowledge(occupation.Id);
            }

            when ABILITY_EXPLANATION {
                return getAbilities(occupation.Id);
            }

            when TASK_EXPLANATION {
                return getTasks(occupation.Id);
            }

            when WORK_CONTEXT_EXPLANATION {
                return getWorkContext(occupation.Id);
            }

            when SOFTWARE_EXPLANATION {
                return getSoftware(occupation.Id);
            }

            when SKILLS {
                return getSkills(occupation.Id);
            }

            when KNOWLEDGE {
                return getKnowledge(occupation.Id);
            }

            when ABILITIES {
                return getAbilities(occupation.Id);
            }

            when TASKS {
                return getTasks(occupation.Id);
            }

            when WORK_CONTEXT {
                return getWorkContext(occupation.Id);
            }

            when SOFTWARE {
                return getSoftware(occupation.Id);
            }

            when OCCUPATION {
                return getOccupationOverview(occupation);
            }

            when OBJECT_OVERVIEW {
                return getObjectOverview(occupation);
            }

            when else {
                return getHelpMessage();
            }
        }
    }

    private static String getOccupationOverview(
        Occupation__c occupation
    ) {
        String answer =
            'Occupation: ' + occupation.Name;

        if (!String.isBlank(occupation.Description__c)) {
            answer +=
                '\n\n' +
                occupation.Description__c;
        }

        answer +=
            '\n\nYou can also ask:' +
            '\n• What are the main tasks?' +
            '\n• What skills are important?' +
            '\n• What software is used?' +
            '\n• What is the work environment?';

        return answer;
    }

    private static String getObjectOverview(Occupation__c occupation) {
        SkillMapDataService.OccupationOverviewData overviewData =
            SkillMapDataService.getOccupationOverviewData(occupation.Id);

        return SkillMapResponseService.buildObjectOverview(overviewData);
    }

    private static String getSkills(Id occupationId) {
        List<Occupation_Skill__c> records = [
            SELECT
                Name,
                Importance__c,
                Skill_Description__c
            FROM Occupation_Skill__c
            WHERE Occupation__c = :occupationId
            ORDER BY Importance__c DESC
            LIMIT 10
        ];

        if (records.isEmpty()) {
            return 'No skills were found for this occupation.';
        }

        String answer =
            'Skills are learned capabilities that help a person perform ' +
            'job activities effectively.\n\n' +
            'Important skills:';

        for (Occupation_Skill__c record : records) {
            answer += '\n• ' + record.Name;

            if (record.Importance__c != null) {
                answer +=
                    ' — Importance: ' +
                    record.Importance__c;
            }
        }

        answer +=
            '\n\nYou can also ask:' +
            '\n• How many skills are stored?' +
            '\n• What abilities are important?' +
            '\n• What are the main tasks?';

        return answer;
    }

    private static String getKnowledge(Id occupationId) {
        List<Occupation_Knowledge__c> records = [
            SELECT
                Name,
                Importance__c,
                Knowledge_Description__c
            FROM Occupation_Knowledge__c
            WHERE Occupation__c = :occupationId
            ORDER BY Importance__c DESC
            LIMIT 10
        ];

        if (records.isEmpty()) {
            return 'No knowledge records were found for this occupation.';
        }

        String answer =
            'Knowledge represents the subjects and information required ' +
            'to perform the occupation successfully.\n\n' +
            'Important knowledge areas:';

        for (Occupation_Knowledge__c record : records) {
            answer += '\n• ' + record.Name;

            if (record.Importance__c != null) {
                answer +=
                    ' — Importance: ' +
                    record.Importance__c;
            }
        }

        answer +=
            '\n\nYou can also ask:' +
            '\n• How many knowledge records are stored?' +
            '\n• Which skills are important?' +
            '\n• What software is used?';

        return answer;
    }

    private static String getAbilities(Id occupationId) {
        List<Occupation_Ability__c> records = [
            SELECT
                Ability_Name__c,
                Importance__c,
                Ability_Description__c
            FROM Occupation_Ability__c
            WHERE Occupation__c = :occupationId
            ORDER BY Importance__c DESC
            LIMIT 10
        ];

        if (records.isEmpty()) {
            return 'No abilities were found for this occupation.';
        }

        String answer =
            'Abilities are the mental or physical capabilities that help ' +
            'someone perform job activities.\n\n' +
            'Important abilities:';

        for (Occupation_Ability__c record : records) {
            answer +=
                '\n• ' +
                record.Ability_Name__c;

            if (record.Importance__c != null) {
                answer +=
                    ' — Importance: ' +
                    record.Importance__c;
            }
        }

        answer +=
            '\n\nYou can also ask:' +
            '\n• How many abilities are stored?' +
            '\n• What skills are important?' +
            '\n• What are the main tasks?';

        return answer;
    }

    private static String getTasks(Id occupationId) {
        List<Occupation_Task__c> records = [
            SELECT
                Occupation_Task__c,
                Importance__c,
                Category__c
            FROM Occupation_Task__c
            WHERE Occupation__c = :occupationId
            ORDER BY Importance__c DESC
            LIMIT 10
        ];

        if (records.isEmpty()) {
            return 'No tasks were found for this occupation.';
        }

        String answer =
            'Tasks describe the actual activities and responsibilities ' +
            'performed in this occupation.\n\nMain tasks:';

        for (Occupation_Task__c record : records) {
            answer +=
                '\n• ' +
                record.Occupation_Task__c;

            if (!String.isBlank(record.Category__c)) {
                answer +=
                    ' (' +
                    record.Category__c +
                    ')';
            }
        }

        answer +=
            '\n\nYou can also ask:' +
            '\n• How many tasks are stored?' +
            '\n• Which skills support these tasks?' +
            '\n• What is the work environment?';

        return answer;
    }

    private static String getWorkContext(Id occupationId) {
        List<Occupation_Work_Context__c> records = [
            SELECT
                Work_Context__c,
                Work_Context_Description__c
            FROM Occupation_Work_Context__c
            WHERE Occupation__c = :occupationId
            ORDER BY Work_Context__c
            LIMIT 10
        ];

        if (records.isEmpty()) {
            return 'No work-context records were found for this occupation.';
        }

        String answer =
            'Work environment information explains the conditions in which ' +
            'the job is performed, such as interaction with people, ' +
            'conflict, working hours, automation, and decision-making.\n\n' +
            'Important work-context factors:';

        for (Occupation_Work_Context__c record : records) {
            answer +=
                '\n• ' +
                record.Work_Context__c;

            if (
                !String.isBlank(
                    record.Work_Context_Description__c
                )
            ) {
                answer +=
                    ': ' +
                    record.Work_Context_Description__c;
            }
        }

        answer +=
            '\n\nYou can also ask:' +
            '\n• What are the main tasks?' +
            '\n• Does this occupation involve conflict?' +
            '\n• What skills are important?';

        return answer;
    }

    private static String getSoftware(Id occupationId) {
        List<Software__c> records = [
            SELECT
                Name,
                Category__c,
                Hot_Technology__c,
                In_Demand__c
            FROM Software__c
            WHERE Occupation__c = :occupationId
            ORDER BY Name
            LIMIT 10
        ];

        if (records.isEmpty()) {
            return 'No software records were found for this occupation.';
        }

        String answer =
            'Software tools help professionals analyse records, manage ' +
            'information, prepare reports, and communicate findings.\n\n' +
            'Software used:';

        for (Software__c record : records) {
            answer += '\n• ' + record.Name;

            if (!String.isBlank(record.Category__c)) {
                answer +=
                    ' — ' +
                    record.Category__c;
            }

            if (record.Hot_Technology__c == true) {
                answer += ' — Hot technology';
            }

            if (record.In_Demand__c == true) {
                answer += ' — In demand';
            }
        }

        answer +=
            '\n\nYou can also ask:' +
            '\n• What skills are important?' +
            '\n• What are the main tasks?' +
            '\n• What knowledge is required?';

        return answer;
    }

    private static String getSkillCount(Id occupationId) {
        Integer total = [
            SELECT COUNT()
            FROM Occupation_Skill__c
            WHERE Occupation__c = :occupationId
        ];

        return
            'There are ' +
            total +
            ' skills stored for this occupation.' +
            '\n\nWould you like to see the most important skills?';
    }

    private static String getKnowledgeCount(Id occupationId) {
        Integer total = [
            SELECT COUNT()
            FROM Occupation_Knowledge__c
            WHERE Occupation__c = :occupationId
        ];

        return
            'There are ' +
            total +
            ' knowledge records stored for this occupation.' +
            '\n\nWould you like to see the top knowledge areas?';
    }

    private static String getAbilityCount(Id occupationId) {
        Integer total = [
            SELECT COUNT()
            FROM Occupation_Ability__c
            WHERE Occupation__c = :occupationId
        ];

        return
            'There are ' +
            total +
            ' abilities stored for this occupation.' +
            '\n\nWould you like to see the most important abilities?';
    }

    private static String getTaskCount(Id occupationId) {
        Integer total = [
            SELECT COUNT()
            FROM Occupation_Task__c
            WHERE Occupation__c = :occupationId
        ];

        return
            'There are ' +
            total +
            ' tasks stored for this occupation.' +
            '\n\nWould you like to see the main tasks?';
    }

    private static String getHelpMessage() {
        return
            'I can help you understand the Fraud Examiners, ' +
            'Investigators and Analysts occupation using the data ' +
            'stored in Salesforce.' +
            '\n\nYou can ask me about:' +
            '\n• The occupation and what it does' +
            '\n• Important skills' +
            '\n• Required knowledge' +
            '\n• Important abilities' +
            '\n• Main tasks and responsibilities' +
            '\n• Software and technology' +
            '\n• Work environment and working conditions' +
            '\n• Record counts' +
            '\n\nExample questions:' +
            '\n• What skills are important?' +
            '\n• Why do we need work environment information?' +
            '\n• How many abilities are stored?' +
            '\n• What software is used?';
    }
}