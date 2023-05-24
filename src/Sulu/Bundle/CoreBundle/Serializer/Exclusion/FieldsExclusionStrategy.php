<?php

declare(strict_types=1);

namespace Sulu\Bundle\CoreBundle\Serializer\Exclusion;

use JMS\Serializer\Context;
use JMS\Serializer\Exclusion\ExclusionStrategyInterface;
use JMS\Serializer\Metadata\ClassMetadata;
use JMS\Serializer\Metadata\PropertyMetadata;

class FieldsExclusionStrategy implements ExclusionStrategyInterface
{
    /** @var array<int, string> */
    private array $requestedFields;

    /** @param array<int, string> $requestedFields */
    public function __construct(array $requestedFields)
    {
        $this->requestedFields = $requestedFields;
    }

    public function shouldSkipClass(ClassMetadata $metadata, Context $navigatorContext): bool
    {
        return false;
    }

    public function shouldSkipProperty(PropertyMetadata $property, Context $navigatorContext): bool
    {
        if (count($this->requestedFields) === 0) {
            return false;
        }

        return !in_array($property->serializedName, $this->requestedFields, true);
    }
}
