package storage

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"stringwise/api/internal/config"
)

type R2Client struct {
	client    *s3.Client
	presigner *s3.PresignClient
	bucket    string
	publicURL string
}

func NewR2(cfg *config.Config) *R2Client {
	endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.R2AccountID)

	s3cfg := aws.Config{
		Region: "auto",
		Credentials: credentials.NewStaticCredentialsProvider(
			cfg.R2AccessKeyID,
			cfg.R2SecretAccessKey,
			"",
		),
		BaseEndpoint: aws.String(endpoint),
	}

	client := s3.NewFromConfig(s3cfg, func(o *s3.Options) {
		o.UsePathStyle = true
	})

	return &R2Client{
		client:    client,
		presigner: s3.NewPresignClient(client),
		bucket:    cfg.R2Bucket,
		publicURL: cfg.R2PublicURL,
	}
}

func (r *R2Client) PresignPut(ctx context.Context, key string, ttl time.Duration) (string, error) {
	req, err := r.presigner.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(ttl))
	if err != nil {
		return "", err
	}
	return req.URL, nil
}

func (r *R2Client) Put(ctx context.Context, key string, body io.Reader, size int64, contentType string) error {
	_, err := r.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(r.bucket),
		Key:           aws.String(key),
		Body:          body,
		ContentLength: aws.Int64(size),
		ContentType:   aws.String(contentType),
	})
	return err
}

func (r *R2Client) Delete(ctx context.Context, key string) error {
	_, err := r.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(key),
	})
	return err
}

func (r *R2Client) PublicURL(key string) string {
	return fmt.Sprintf("%s/%s", r.publicURL, key)
}
