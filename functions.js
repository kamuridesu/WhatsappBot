/**
 * Checks the metadata for one group
 * @param {object} group_metadata 
 * @param {string} bot_number 
 * @param {string} sender 
 * @returns {object} group_data;
 */
async function checkGroupData(group_metadata, bot_number, sender) {
    group_data = {
        // "group_metadata": undefined,
        "group_name": undefined,
        "group_id": undefined,
        "group_members": undefined,
        "group_admins": undefined,
        "bot_is_group_admin": undefined,
        "sender_is_group_admin": undefined,
        "group_description": undefined,
        "welcome_on": undefined,
    }
    group_data.group_name = group_metadata.subject
    group_data.group_id = group_metadata.id;
    group_data.group_members = group_metadata.participants;
    const group_admins = group_metadata.participants.map(member => {
        if (member.isAdmin) {
            return member;
        }
    });
    group_data.group_admins = group_admins.filter(element => {
        return element !== undefined;
    });
    group_data.bot_is_group_admin = group_metadata.participants.includes(bot_number);
    group_data.sender_is_group_admin = group_data.group_admins.includes(sender);
    group_data.group_description = group_metadata.desc;
    return group_data;
}

exports.checkGroupData = checkGroupData;