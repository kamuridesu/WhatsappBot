async function syncGroupDBData(db, data) {
    let group_data = await db.get_group_infos(data.id);
    if (group_data == null) {
        await db.insert("groups", {
            jid: data.id,
            name: data.name,
            chatbot: false,
            nsfw: false,
            locked: false,
            description: "",
            owner: data.owner,
            sender_is_group_owner: false,
            sender_is_admin: false,
            bot_is_admin: false,
            members: JSON.stringify(data.members),
            admins: JSON.stringify(data.admins_info),
        });
    } else {
        // update all
        await db.update("groups", data, {id: data.id});
    }
}


export { syncGroupDBData };