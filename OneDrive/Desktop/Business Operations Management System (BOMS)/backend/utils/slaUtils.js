exports.isSLABreached = (task) => {
  if (!task.deadline) return false;

  const now = new Date();
  const deadline = new Date(task.deadline);

  return now > deadline;
};
