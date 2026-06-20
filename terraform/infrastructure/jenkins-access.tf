resource "aws_eks_access_entry" "jenkins_ci" {
  cluster_name  = aws_eks_cluster.main.name
  principal_arn = "arn:aws:iam::227655494308:user/jenkins-ci"
  type          = "STANDARD"
}

resource "aws_eks_access_policy_association" "jenkins_ci_edit" {
  cluster_name  = aws_eks_cluster.main.name
  principal_arn = aws_eks_access_entry.jenkins_ci.principal_arn
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSEditPolicy"

  access_scope {
    type = "cluster"
  }
}
