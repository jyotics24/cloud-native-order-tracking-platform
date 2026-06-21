resource "aws_sns_topic" "alerts" {
  name = "order-tracking-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = "Jyotiprakashkhuntia999@gmail.com"
}

resource "aws_cloudwatch_metric_alarm" "jenkins_cpu_high" {
  alarm_name          = "OrderTracking-Jenkins-HighCPU"
  alarm_description   = "Triggers when Jenkins EC2 CPU exceeds 50% for 10 minutes"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods   = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 50

  dimensions = {
    InstanceId = aws_instance.jenkins.id
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
}

output "sns_alert_topic_arn" {
  description = "SNS topic ARN for order tracking alerts"
  value       = aws_sns_topic.alerts.arn
}
