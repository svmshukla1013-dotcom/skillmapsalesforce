public with sharing class SkillMapIntentService {

    public enum ChatIntent {
        SKILL_COUNT,
        KNOWLEDGE_COUNT,
        ABILITY_COUNT,
        TASK_COUNT,

        SKILL_EXPLANATION,
        KNOWLEDGE_EXPLANATION,
        ABILITY_EXPLANATION,
        TASK_EXPLANATION,
        WORK_CONTEXT_EXPLANATION,
        SOFTWARE_EXPLANATION,

        SKILLS,
        KNOWLEDGE,
        ABILITIES,
        TASKS,
        WORK_CONTEXT,
        SOFTWARE,
        OCCUPATION,
        OBJECT_OVERVIEW,
        HELP
    }

    public static ChatIntent detectIntent(String question) {
        if (String.isBlank(question)) {
            return ChatIntent.HELP;
        }

        String normalizedQuestion = question.toLowerCase().trim();

        if (
            normalizedQuestion.contains('how many skills') ||
            normalizedQuestion.contains('number of skills')
        ) {
            return ChatIntent.SKILL_COUNT;
        }

        if (
            normalizedQuestion.contains('how many knowledge') ||
            normalizedQuestion.contains('knowledge count') ||
            normalizedQuestion.contains('knowledge records')
        ) {
            return ChatIntent.KNOWLEDGE_COUNT;
        }

        if (
            normalizedQuestion.contains('how many abilities') ||
            normalizedQuestion.contains('number of abilities')
        ) {
            return ChatIntent.ABILITY_COUNT;
        }

        if (
            normalizedQuestion.contains('how many tasks') ||
            normalizedQuestion.contains('number of tasks')
        ) {
            return ChatIntent.TASK_COUNT;
        }

        if (
            normalizedQuestion.contains('why are skills important') ||
            normalizedQuestion.contains('why do we need skills') ||
            normalizedQuestion.contains('what is a skill') ||
            normalizedQuestion.contains('what are skills')
        ) {
            return ChatIntent.SKILL_EXPLANATION;
        }

        if (
            normalizedQuestion.contains('why is knowledge important') ||
            normalizedQuestion.contains('why do we need knowledge') ||
            normalizedQuestion.contains('what is knowledge')
        ) {
            return ChatIntent.KNOWLEDGE_EXPLANATION;
        }

        if (
            normalizedQuestion.contains('why are abilities important') ||
            normalizedQuestion.contains('why do we need abilities') ||
            normalizedQuestion.contains('what is an ability') ||
            normalizedQuestion.contains('what are abilities')
        ) {
            return ChatIntent.ABILITY_EXPLANATION;
        }

        if (
            normalizedQuestion.contains('why are tasks important') ||
            normalizedQuestion.contains('why do we need tasks') ||
            normalizedQuestion.contains('what is a task') ||
            normalizedQuestion.contains('what are tasks')
        ) {
            return ChatIntent.TASK_EXPLANATION;
        }

        if (
            normalizedQuestion.contains('why do we need work environment') ||
            normalizedQuestion.contains('why is work environment important') ||
            normalizedQuestion.contains('what is work environment') ||
            normalizedQuestion.contains('what is work context')
        ) {
            return ChatIntent.WORK_CONTEXT_EXPLANATION;
        }

        if (
            normalizedQuestion.contains('what is software') ||
            normalizedQuestion.contains('why is software important') ||
            normalizedQuestion.contains('why do we need software')
        ) {
            return ChatIntent.SOFTWARE_EXPLANATION;
        }

        if (
            normalizedQuestion.contains('what can you do') ||
            normalizedQuestion.contains('what more can you tell') ||
            normalizedQuestion.contains('how can you help') ||
            normalizedQuestion == 'help'
        ) {
            return ChatIntent.HELP;
        }

        if (
            normalizedQuestion.contains('what are these objects used for') ||
            normalizedQuestion.contains('how are the occupation objects connected') ||
            normalizedQuestion.contains('tell me more about this occupation') ||
            normalizedQuestion.contains('what information is stored for an occupation') ||
            normalizedQuestion.contains('what information is stored for this occupation') ||
            normalizedQuestion.contains('explain the full occupation data') ||
            normalizedQuestion.contains('explain the full occupation')
        ) {
            return ChatIntent.OBJECT_OVERVIEW;
        }

        if (
            normalizedQuestion.contains('skill') ||
            normalizedQuestion.contains('skills')
        ) {
            return ChatIntent.SKILLS;
        }

        if (
            normalizedQuestion.contains('knowledge') ||
            normalizedQuestion.contains('know')
        ) {
            return ChatIntent.KNOWLEDGE;
        }

        if (
            normalizedQuestion.contains('ability') ||
            normalizedQuestion.contains('abilities')
        ) {
            return ChatIntent.ABILITIES;
        }

        if (
            normalizedQuestion.contains('task') ||
            normalizedQuestion.contains('responsibility') ||
            normalizedQuestion.contains('responsibilities') ||
            normalizedQuestion.contains('what does this job do')
        ) {
            return ChatIntent.TASKS;
        }

        if (
            normalizedQuestion.contains('work environment') ||
            normalizedQuestion.contains('work context') ||
            normalizedQuestion.contains('working condition')
        ) {
            return ChatIntent.WORK_CONTEXT;
        }

        if (
            normalizedQuestion.contains('software') ||
            normalizedQuestion.contains('technology') ||
            normalizedQuestion.contains('tool')
        ) {
            return ChatIntent.SOFTWARE;
        }

        if (
            normalizedQuestion.contains('occupation') ||
            normalizedQuestion.contains('job') ||
            normalizedQuestion.contains('fraud examiner')
        ) {
            return ChatIntent.OCCUPATION;
        }

        return ChatIntent.HELP;
    }
}